<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { sequence, currentStep }: {
		sequence: number[];
		currentStep: number;
	} = $props();

	let scrollEl: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		if (scrollEl && currentStep >= 0) {
			const block = scrollEl.children[currentStep] as HTMLElement;
			if (block) {
				block.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
			}
		}
	});
</script>

{#if sequence.length > 0}
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<div class="flex items-center gap-2 mb-2">
			<h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide">Memory Access Sequence</h3>
			<span class="text-xs text-gray-400">({sequence.length} accesses)</span>
		</div>

		<div bind:this={scrollEl} class="flex items-center gap-1 overflow-x-auto overflow-y-hidden py-3 px-1 scrollbar-thin">
			{#each sequence as block, i}
				<div
					class="flex-shrink-0 flex items-center"
					transition:fly={{ x: 10, duration: 150, easing: quintOut }}
				>
					<div
						class="relative flex items-center justify-center w-10 h-8 rounded font-mono text-xs font-bold transition-all duration-200
							{i === currentStep
								? 'bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300'
								: i < currentStep
									? 'bg-gray-200 text-gray-500'
									: 'bg-gray-100 text-gray-700 border border-gray-300'
							}"
					>
						{block}
						{#if i === currentStep}
							<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-blue-600"></div>
						{/if}
					</div>
					{#if i < sequence.length - 1}
						<span class="text-gray-300 mx-0.5 text-xs">→</span>
					{/if}
				</div>
			{/each}
		</div>

		<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
			<div class="flex items-center gap-3 text-xs">
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded bg-blue-600"></div>
					<span class="text-gray-500">Current</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded bg-gray-200"></div>
					<span class="text-gray-500">Completed</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
					<span class="text-gray-500">Remaining</span>
				</div>
			</div>
			<div class="text-xs text-gray-500 font-mono">
				Accessing block <span class="font-bold text-blue-700">{sequence[currentStep] ?? '-'}</span>
				at index <span class="font-bold">{currentStep}</span>
			</div>
		</div>
	</div>
{/if}
