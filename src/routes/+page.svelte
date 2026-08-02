<script lang="ts">
	import type { CacheConfig, CacheLine, SimulationStatistics, TraceEntry, TestCaseType } from '$lib/cache/types';
	import { CacheSimulator } from '$lib/simulator/CacheSimulator';
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

	let dmSimulator = $state<CacheSimulator | null>(null);
	let faSimulator = $state<CacheSimulator | null>(null);
	let sequence = $state<number[]>([]);

	let dmTrace = $state<TraceEntry[]>([]);
	let faTrace = $state<TraceEntry[]>([]);
	let dmSnapshot = $state<CacheLine[]>([]);
	let faSnapshot = $state<CacheLine[]>([]);

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

	function handleApplyConfig() {
		if (sequence.length > 0) {
			handleLoadSequence(sequence);
		}
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
				class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
			>
				⚙ Config
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
			onReset={handleReset}
			onLoadSequence={handleLoadSequence}
		/>

		<SequenceBar
			{sequence}
			{currentStep}
		/>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<CachePanel
			title="Direct-Mapped"
			lines={dmSnapshot}
			stats={dmStats}
			hitLine={dmHighlight.hitLine}
			evictionLine={dmHighlight.evictionLine}
			highlightedLine={dmHighlight.highlightedLine}
			showLastUsed={false}
		/>
		<CachePanel
			title="Fully Associative (MRU)"
			lines={faSnapshot}
			stats={faStats}
			hitLine={faHighlight.hitLine}
			evictionLine={faHighlight.evictionLine}
			highlightedLine={faHighlight.highlightedLine}
			showLastUsed={true}
		/>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<DataFlowVisualizer
				trace={dmTrace.length > 0 ? dmTrace[dmTrace.length - 1] : null}
				cacheLines={dmSnapshot}
				config={cacheConfig}
				label="Direct-Mapped"
			/>
			<DataFlowVisualizer
				trace={faTrace.length > 0 ? faTrace[faTrace.length - 1] : null}
				cacheLines={faSnapshot}
				config={cacheConfig}
				label="Fully Associative (MRU)"
			/>
		</div>

		<TraceLog
			{dmTrace}
			{faTrace}
			{currentStep}
		/>
	</div>
</div>

<ConfigModal
	bind:config={cacheConfig}
	bind:open={showConfig}
	onApply={handleApplyConfig}
/>
