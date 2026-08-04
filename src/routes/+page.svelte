<script lang="ts">
	import type { CacheConfig, CacheLine, SimulationStatistics, TraceEntry, TestCaseType } from '$lib/cache/types';
	import { CacheSimulator } from '$lib/simulator/CacheSimulator';
	import { compareCaches } from '$lib/simulator/compareCaches';
	import { formatComparisonToText } from '$lib/simulator/traceFormatter';
	import ControlBar from '$lib/components/ControlBar.svelte';
	import CachePanel from '$lib/components/CachePanel.svelte';
	import TraceLog from '$lib/components/TraceLog.svelte';
	import ConfigModal from '$lib/components/ConfigModal.svelte';
	import DataFlowVisualizer from '$lib/components/DataFlowVisualizer.svelte';
	import SequenceBar from '$lib/components/SequenceBar.svelte';

	let cacheConfig = $state<CacheConfig>({
		blockSizeWords: 2,
		cacheBlockCount: 8,
		mainMemoryBlockCount: 1024,
		readPolicy: 'non-load-through',
		cacheAccessTimeNs: 1,
		memoryAccessTimeNs: 10,
	});

	let selectedPreset = $state<TestCaseType>('Sequential');
	let customInput = $state('');
	let isPlaying = $state(false);
	let currentStep = $state(0);
	let totalSteps = $state(0);
	let playbackSpeed = $state(500);
	let showConfig = $state(false);
	let didSkip = $state(false);

	let dmSimulator = $state<CacheSimulator | null>(null);
	let faSimulator = $state<CacheSimulator | null>(null);
	let sequence = $state<number[]>([]);

	let dmTrace = $state<TraceEntry[]>([]);
	let faTrace = $state<TraceEntry[]>([]);
	// svelte-ignore state_referenced_locally
	let dmSnapshot = $state<CacheLine[]>(createEmptyLines(cacheConfig.cacheBlockCount));
	// svelte-ignore state_referenced_locally
	let faSnapshot = $state<CacheLine[]>(createEmptyLines(cacheConfig.cacheBlockCount));

	let dmStats = $state<SimulationStatistics>({
		totalAccesses: 0, hits: 0, misses: 0, hitRate: 0, missRate: 0, averageMemoryAccessTimeNs: 0, totalMemoryAccessTimeNs: 0,
	});
	let faStats = $state<SimulationStatistics>({
		totalAccesses: 0, hits: 0, misses: 0, hitRate: 0, missRate: 0, averageMemoryAccessTimeNs: 0, totalMemoryAccessTimeNs: 0,
	});

	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	function createEmptyLines(count: number): CacheLine[] {
		return Array.from({ length: count }, (_, i) => ({
			lineIndex: i, valid: false, memoryBlock: null, tag: null, lastUsedStep: 0,
		}));
	}

	function doStep(): boolean {
		if (!dmSimulator || !faSimulator) return false;
		if (currentStep >= totalSteps) return false;

		const dmOk = dmSimulator.step();
		const faOk = faSimulator.step();
		if (!dmOk || !faOk) return false;

		currentStep++;
		dmTrace = dmSimulator.getTrace();
		faTrace = faSimulator.getTrace();
		dmSnapshot = dmSimulator.getCurrentSnapshot().lines;
		faSnapshot = faSimulator.getCurrentSnapshot().lines;
		dmStats = dmSimulator.getStatistics();
		faStats = faSimulator.getStatistics();
		return true;
	}

	function scheduleNext() {
		if (!isPlaying) return;
		timeoutId = setTimeout(() => {
			const ok = doStep();
			if (!ok || !isPlaying) {
				stopPlayback();
				return;
			}
			scheduleNext();
		}, playbackSpeed);
	}

	function handleLoadSequence(seq: number[]) {
		stopPlayback();
		sequence = seq;
		totalSteps = seq.length;
		currentStep = 0;

		dmSimulator = new CacheSimulator('Direct-Mapped', cacheConfig);
		faSimulator = new CacheSimulator('Fully-Associative-MRU', cacheConfig);
		dmSimulator.loadSequence(seq);
		faSimulator.loadSequence(seq);

		dmTrace = [];
		faTrace = [];
		dmSnapshot = createEmptyLines(cacheConfig.cacheBlockCount);
		faSnapshot = createEmptyLines(cacheConfig.cacheBlockCount);
		dmStats = dmSimulator.getStatistics();
		faStats = faSimulator.getStatistics();
	}

	function handlePlay() {
		if (isPlaying) return;
		isPlaying = true;
		scheduleNext();
	}

	function handlePause() {
		stopPlayback();
	}

	function stopPlayback() {
		isPlaying = false;
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	function handleStep() {
		stopPlayback();
		doStep();
	}

	function handleReset() {
		stopPlayback();
		if (sequence.length > 0) {
			handleLoadSequence(sequence);
		}
	}

	function handleSkip() {
		if (!dmSimulator || !faSimulator) return;
		if (currentStep >= totalSteps) return;

		stopPlayback();
		dmSimulator.runToEnd();
		faSimulator.runToEnd();

		currentStep = totalSteps;
		dmTrace = dmSimulator.getTrace();
		faTrace = faSimulator.getTrace();
		dmSnapshot = dmSimulator.getCurrentSnapshot().lines;
		faSnapshot = faSimulator.getCurrentSnapshot().lines;
		dmStats = dmSimulator.getStatistics();
		faStats = faSimulator.getStatistics();

		didSkip = true;
		setTimeout(() => { didSkip = false; }, 500);
	}

	function handleApplyConfig() {
		if (sequence.length > 0) {
			handleLoadSequence(sequence);
		}
	}

	function handleExport() {
		if (sequence.length === 0) return;
		const comparison = compareCaches(cacheConfig, sequence);
		const text = formatComparisonToText(comparison);
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `cache-trace-${new Date().toISOString().slice(0, 10)}.txt`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	let dmHighlight = $derived.by(() => {
		if (dmTrace.length === 0) return { hitLine: -1, evictionLine: -1, highlightedLine: -1 };
		const last = dmTrace[dmTrace.length - 1];
		return {
			hitLine: last.isHit ? last.cacheLineIndex : -1,
			evictionLine: last.evictedBlock !== null ? last.cacheLineIndex : -1,
			highlightedLine: !last.isHit ? last.cacheLineIndex : -1,
		};
	});

	let faHighlight = $derived.by(() => {
		if (faTrace.length === 0) return { hitLine: -1, evictionLine: -1, highlightedLine: -1 };
		const last = faTrace[faTrace.length - 1];
		return {
			hitLine: last.isHit ? last.cacheLineIndex : -1,
			evictionLine: last.evictedBlock !== null ? last.cacheLineIndex : -1,
			highlightedLine: !last.isHit ? last.cacheLineIndex : -1,
		};
	});

	$effect(() => {
		if (sequence.length <= 0) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			if (showConfig) return;

			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;

			const isSpace = e.key === ' ' || e.key === 'Space' || e.code === 'Space';

			if (isSpace) {
				e.preventDefault();
				if (isPlaying) { handlePause(); }
				else { handlePlay(); }
				return;
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				handleStep();
				return;
			}
			if (e.key === 'R' || e.key === 'r') {
				e.preventDefault();
				handleReset();
			}
			if (e.key === 'End') {
				e.preventDefault();
				handleSkip();
			}
		}

		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});
</script>

<svelte:head>
	<title>Cache Simulator — Direct vs Fully Associative</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-4 md:p-6">
	<div class="max-w-7xl mx-auto flex flex-col gap-4">
		<header class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-bold text-gray-900">Cache Memory Simulator</h1>
				<p class="text-sm text-gray-500">Direct-Mapped vs Fully Associative (MRU)</p>
			</div>
			<button
				onclick={() => showConfig = true}
				class="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
			>
				<svg 
					xmlns="http://www.w3.org/2000/svg" 
					width="14" 
					height="14" 
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor" 
					stroke-width="2" 
					stroke-linecap="round" 
					stroke-linejoin="round" 
					class="text-[#c9d1d9]"
				>
					<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
					<circle cx="12" cy="12" r="3"/>
				</svg>
				<span>Config</span>
			</button>
		</header>

		<ControlBar
			bind:selectedPreset
			bind:customInput
			bind:cacheConfig
			bind:isPlaying
			bind:currentStep
			bind:totalSteps
			bind:playbackSpeed
			{sequence}
			onPlay={handlePlay}
			onPause={handlePause}
			onStep={handleStep}
			onSkip={handleSkip}
			onReset={handleReset}
			onLoadSequence={handleLoadSequence}
		/>

		{#if sequence.length > 0}
			<SequenceBar
				{sequence}
				{currentStep}
				{didSkip}
			/>
		{:else}
			<h1 class="text-xl font-bold text-gray-900">No sequence loaded — choose a preset and press Load</h1>
		{/if}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<CachePanel
				title="Direct-Mapped"
				lines={dmSnapshot}
				stats={dmStats}
				hitLine={dmHighlight.hitLine}
				evictionLine={dmHighlight.evictionLine}
				highlightedLine={dmHighlight.highlightedLine}
				showLastUsed={false}
				{didSkip}
			/>
			<CachePanel
				title="Fully Associative (MRU)"
				lines={faSnapshot}
				stats={faStats}
				hitLine={faHighlight.hitLine}
				evictionLine={faHighlight.evictionLine}
				highlightedLine={faHighlight.highlightedLine}
				showLastUsed={true}
				{didSkip}
			/>
			</div>


			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DataFlowVisualizer
					trace={!didSkip && dmTrace.length > 0 ? dmTrace[dmTrace.length - 1] : null}
					cacheLines={dmSnapshot}
					config={cacheConfig}
					label="Direct-Mapped"
				/>
				<DataFlowVisualizer
					trace={!didSkip && faTrace.length > 0 ? faTrace[faTrace.length - 1] : null}
					cacheLines={faSnapshot}
					config={cacheConfig}
					label="Fully Associative (MRU)"
				/>
			</div>
			{#if sequence.length > 0}
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Access Trace</h3>
				<button
					onclick={handleExport}
					class="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
					title="Download full trace as plain text"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="7 10 12 15 17 10"/>
						<line x1="12" y1="15" x2="12" y2="3"/>
					</svg>
					<span>Export Trace (.txt)</span>
				</button>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<TraceLog
					trace={dmTrace}
					{currentStep}
					label="Direct-Mapped"
					{didSkip}
				/>
				<TraceLog
					trace={faTrace}
					{currentStep}
					label="Fully Associative (MRU)"
					{didSkip}
				/>
			</div>
			{/if}

	</div>
</div>

<ConfigModal
	bind:config={cacheConfig}
	bind:open={showConfig}
	onApply={handleApplyConfig}
/>
