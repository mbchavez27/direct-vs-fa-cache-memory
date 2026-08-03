<script lang="ts">
	import type { TraceEntry } from '$lib/cache/types';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { trace, currentStep, label }: {
		trace: TraceEntry[];
		currentStep: number;
		label: string;
	} = $props();

	let logEl: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		if (logEl && currentStep > 0) {
			requestAnimationFrame(() => {
				logEl?.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
			});
		}
	});
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
	<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide px-3 pt-2 pb-1">{label}</h3>
	<div bind:this={logEl} class="overflow-auto max-h-80 text-xs font-mono">
		<table class="w-full">
			<thead class="bg-gray-100 sticky top-0">
				<tr>
					<th class="px-2 py-1 text-left">Step</th>
					<th class="px-2 py-1 text-left">Block</th>
					<th class="px-2 py-1 text-center">H/M</th>
					<th class="px-2 py-1 text-center">Line</th>
					<th class="px-2 py-1 text-center">Tag</th>
					<th class="px-2 py-1 text-left">Explanation</th>
				</tr>
			</thead>
			<tbody>
				{#each trace as entry, i (entry.step)}
					{@const isActive = entry.step === currentStep}
					<tr
						class="border-t {isActive ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}"
						in:fly={{ y: 20, duration: 200, easing: quintOut }}
					>
						<td class="px-2 py-1 text-gray-500">{entry.step}</td>
						<td class="px-2 py-1 font-semibold">{entry.memoryBlock}</td>
						<td class="px-2 py-1 text-center">
							<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold {entry.isHit ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
								{entry.isHit ? 'HIT' : 'MISS'}
							</span>
						</td>
						<td class="px-2 py-1 text-center text-gray-600">{entry.cacheLineIndex}</td>
						<td class="px-2 py-1 text-center text-gray-600">{entry.tag}</td>
						<td class="px-2 py-1 text-gray-500 max-w-[200px] truncate" title={entry.explanation}>
							{entry.explanation}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
