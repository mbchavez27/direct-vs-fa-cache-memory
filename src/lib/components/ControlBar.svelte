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
		onPlay = () => {},
		onPause = () => {},
		onStep = () => {},
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
		onPlay: () => void;
		onPause: () => void;
		onStep: () => void;
		onReset: () => void;
		onLoadSequence: (seq: number[]) => void;
	} = $props();

	let error = $state('');

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

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<div class="flex flex-wrap items-end gap-3">
		<div class="flex flex-col gap-1">
			<label for="preset-select" class="text-xs font-medium text-gray-600">Preset</label>
			<select
				id="preset-select"
				bind:value={selectedPreset}
				class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
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
			class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
		>
			Load
		</button>

		<div class="h-6 w-px bg-gray-200 mx-1"></div>

		<div class="flex gap-1">
			{#if isPlaying}
				<button
					onclick={onPause}
					class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
					title="Pause"
				>
					Pause
				</button>
			{:else}
				<button
					onclick={onPlay}
					disabled={totalSteps === 0 || currentStep >= totalSteps}
					class="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
					title="Play"
				>
					Play
				</button>
			{/if}

			<button
				onclick={onStep}
				disabled={isPlaying || totalSteps === 0 || currentStep >= totalSteps}
				class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
				title="Step"
			>
				Step
			</button>

			<button
				onclick={onReset}
				class="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
				title="Reset"
			>
				Reset
			</button>
		</div>

		<div class="flex flex-col gap-1">
			<label for="speed-slider" class="text-xs font-medium text-gray-600">Speed ({playbackSpeed}ms)</label>
			<input
				id="speed-slider"
				type="range"
				min="50"
				max="2000"
				step="50"
				bind:value={playbackSpeed}
				class="w-24"
			/>
		</div>

		<div class="text-sm text-gray-500 ml-auto">
			Step <span class="font-mono font-bold">{currentStep}</span> / <span class="font-mono">{totalSteps}</span>
		</div>
	</div>

	{#if error}
		<div class="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</div>
	{/if}
</div>
