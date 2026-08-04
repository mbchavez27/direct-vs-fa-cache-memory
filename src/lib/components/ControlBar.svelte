<script lang="ts">
	import type { TestCaseType, CacheConfig } from '$lib/cache/types';
	import { generateSequential } from '$lib/generators/sequential';
	import { generateMidRepeat } from '$lib/generators/midRepeat';
	import { generateRandom } from '$lib/generators/random';
	import { parseCustomSequence } from '$lib/generators/custom';

	let {
		selectedPreset = $bindable('Sequential'),
		customInput = $bindable(''),
		cacheConfig = $bindable({} as CacheConfig),
		isPlaying = $bindable(false),
		currentStep = $bindable(0),
		totalSteps = $bindable(0),
		playbackSpeed = $bindable(500),
		sequence = [],
		onPlay = () => {},
		onPause = () => {},
		onStep = () => {},
		onStepBack = () => {},
		onSkip = () => {},
		onReset = () => {},
		onLoadSequence = (_seq: number[]) => {},
	}: {
		selectedPreset: TestCaseType;
		customInput: string;
		cacheConfig: CacheConfig;
		isPlaying: boolean;
		currentStep: number;
		totalSteps: number;
		playbackSpeed: number;
		sequence: number[];
		onPlay: () => void;
		onPause: () => void;
		onStep: () => void;
		onStepBack: () => void;
		onSkip: () => void;
		onReset: () => void;
		onLoadSequence: (seq: number[]) => void;
	} = $props();

	let error = $state('');
	let skipAnimating = $state(false);

	const presets: TestCaseType[] = ['Sequential', 'Mid-repeat', 'Random', 'Custom'];

	function generateSequence(): number[] {
		error = '';
		try {
			switch (selectedPreset) {
				case 'Sequential':
					return generateSequential(cacheConfig.cacheBlockCount);
				case 'Mid-repeat':
					return generateMidRepeat(cacheConfig.cacheBlockCount);
				case 'Random':
					return generateRandom();
				case 'Custom':
					return parseCustomSequence(customInput);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
			return [];
		}
	}

	function handleLoad() {
		const seq = generateSequence();
		if (seq.length > 0) {
			onLoadSequence(seq);
		}
	}
</script>

<div class="bg-[#161b22] rounded-lg border border-gray-200 p-3">
	<div class="flex flex-wrap items-end gap-3">
		<div class="flex flex-col gap-1">
			<label for="preset-select" class="text-xs font-medium text-gray-600">Preset</label>
			<select
				id="preset-select"
				bind:value={selectedPreset}
				class="border border-[#30363d] rounded px-2 py-1.5 text-sm bg-[#21262d] text-[#c9d1d9]"
			>
				{#each presets as preset}
					<option value={preset}>{preset}</option>
				{/each}
			</select>
		</div>

		{#if selectedPreset === 'Custom'}
			<div class="flex flex-col gap-1 flex-1 min-w-[200px]">
				<label for="custom-sequence" class="text-xs font-medium text-gray-600">Sequence (0-1023, comma/space separated)</label>
				<input
					id="custom-sequence"
					type="text"
					bind:value={customInput}
					placeholder="e.g. 1, 17, 2, 1023, 3, 19, 1, 1"
					class="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
				/>
			</div>
		{/if}

		<button
			onclick={handleLoad}
			class="bg-[#1f6feb]/20 hover:bg-[#1f6feb]/35 text-[#58a6ff] border border-[#1f6feb]/40 text-sm font-medium px-3 py-1.5 rounded transition-colors"
		>
			Load
		</button>

		<div class="h-6 w-px bg-gray-200 mx-1"></div>

		<div class="flex gap-1">
			{#if isPlaying}
				<button
					onclick={onPause}
					class="bg-[#d29922]/20 hover:bg-[#d29922]/35 text-[#d29922] border border-[#d29922]/40 text-sm font-medium px-3 py-1.5 rounded transition-colors"
					title="Pause"
				>
					Pause
				</button>
			{:else}
				<button
					onclick={onPlay}
					disabled={totalSteps === 0 || currentStep >= totalSteps}
					class="bg-[#238636]/20 hover:bg-[#238636]/35 disabled:opacity-40 disabled:cursor-not-allowed text-[#3fb950] border border-[#238636]/40 text-sm font-medium px-3 py-1.5 rounded transition-colors"
					title="Play"
				>
					Play
				</button>
			{/if}

			<button
				onclick={onStepBack}
				disabled={isPlaying || totalSteps === 0 || currentStep <= 0}
				class="bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-[#c9d1d9] border border-[#30363d] text-sm font-medium px-3 py-1.5 rounded transition-colors"
				title="Step back"
			>
				Back
			</button>

			<button
				onclick={onStep}
				disabled={isPlaying || totalSteps === 0 || currentStep >= totalSteps}
				class="bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-[#c9d1d9] border border-[#30363d] text-sm font-medium px-3 py-1.5 rounded transition-colors"
				title="Step"
			>
				Step
			</button>

			<button
				onclick={() => {
					skipAnimating = true;
					onSkip();
					setTimeout(() => { skipAnimating = false; }, 500);
				}}
				disabled={isPlaying || totalSteps === 0 || currentStep >= totalSteps}
				class="bg-[#8957e5]/20 hover:bg-[#8957e5]/35 disabled:opacity-40 disabled:cursor-not-allowed text-[#d2a8ff] border border-[#8957e5]/40 text-sm font-medium px-3 py-1.5 rounded transition-colors {skipAnimating ? 'animate-skip-glow' : ''}"
				title="Skip to end"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle">
					<polygon points="5 4 15 12 5 20 5 4"/>
					<line x1="19" y1="5" x2="19" y2="19"/>
				</svg>
				<span class="align-middle">Skip</span>
			</button>

			<button
				onclick={onReset}
				disabled={totalSteps === 0}
				class="bg-[#da3633]/20 hover:bg-[#da3633]/35 disabled:opacity-40 disabled:cursor-not-allowed text-[#f85149] border border-[#f85149]/40 text-sm font-medium px-3 py-1.5 rounded transition-colors"
				title="Reset"
			>
				Reset
			</button>
		</div>

		<div class="flex flex-col gap-2">
			<label for="speed-slider" class="text-xs font-medium text-gray-600">Speed ({playbackSpeed}ms)</label>
			<input
				id="speed-slider"
				type="range"
				min="50"
				max="2000"
				step="50"
				bind:value={playbackSpeed}
				class="w-24 h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer border border-[#30363d]
					[&::-webkit-slider-thumb]:appearance-none 
					[&::-webkit-slider-thumb]:w-3 
					[&::-webkit-slider-thumb]:h-3.5 
					[&::-webkit-slider-thumb]:rounded 
					[&::-webkit-slider-thumb]:bg-[#161b22] 
					[&::-webkit-slider-thumb]:border 
					[&::-webkit-slider-thumb]:border-[#58a6ff] 
					[&::-moz-range-thumb]:w-3 
					[&::-moz-range-thumb]:h-3.5 
					[&::-moz-range-thumb]:rounded 
					[&::-moz-range-thumb]:bg-[#161b22] 
					[&::-moz-range-thumb]:border 
					[&::-moz-range-thumb]:border-[#58a6ff]"
			/>
		</div>

		<div class="text-sm text-gray-500 ml-auto flex items-center gap-3">
			{#if sequence.length > 0}
				<div class="flex items-center gap-1 text-xs">
					<span class="text-gray-500">Block:</span>
					<span class="font-mono font-bold text-blue-700 text-sm">{sequence[currentStep - 1] ?? '-'}</span>
					<span class="text-gray-400 mx-1">|</span>
					<span class="text-gray-500">Seq:</span>
					<span class="font-mono text-gray-600">
						{#if sequence.length <= 7}
							{#each sequence as block, i}
								{#if i === currentStep - 1}
									<span class="text-blue-700 font-bold">[{block}]</span>
								{:else}
									<span class:text-gray-400={i < currentStep - 1}>{block}</span>
								{/if}
								{#if i < sequence.length - 1}<span class="text-gray-400"> → </span>{/if}
							{/each}
						{:else}
							{#each sequence.slice(0, 3) as block, i}
								{#if i === currentStep - 1}
									<span class="text-blue-700 font-bold">[{block}]</span>
								{:else}
									<span class:text-gray-400={i < currentStep - 1}>{block}</span>
								{/if}
								<span class="text-gray-400"> → </span>
							{/each}
							<span class="text-gray-400">... </span>
							{#if currentStep - 1 >= 3}
								<span class="text-blue-700 font-bold">[{sequence[currentStep - 1]}]</span>
							{/if}
							<span class="text-gray-400"> → </span>
							{#each sequence.slice(-2) as block, i}
								{#if currentStep - 1 === sequence.length - 2 + i}
									<span class="text-blue-700 font-bold">[{block}]</span>
								{:else}
									<span>{block}</span>
								{/if}
								{#if i < 1}<span class="text-gray-400"> → </span>{/if}
							{/each}
						{/if}
					</span>
				</div>
			{/if}
			<div class="flex items-center gap-2">
				<div>
					Step <span class="font-mono font-bold">{currentStep}</span> / <span class="font-mono">{totalSteps}</span>
				</div>
				{#if sequence.length > 0 && currentStep >= totalSteps}
					<span
						class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-200 text-green-800"
						title="All steps executed"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 6 9 17l-5-5"/>
						</svg>
						Completed
					</span>
				{/if}
			</div>
		</div>
	</div>
	{#if error}
		<div class="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</div>
	{/if}
	<p class="text-xs font-medium text-gray-600 pt-1"> Space - play/pause | ← → arrow keys - step back/forward | End - skip | R - reset</p>
</div>
