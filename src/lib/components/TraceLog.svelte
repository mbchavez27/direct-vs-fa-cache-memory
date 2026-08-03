<script lang="ts">
	import type { TraceEntry } from '$lib/cache/types';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { dmTrace, faTrace, currentStep }: {
		dmTrace: TraceEntry[];
		faTrace: TraceEntry[];
		currentStep: number;
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
	<h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide px-3 pt-2 pb-1">Access Trace</h3>
	<div bind:this={logEl} class="overflow-auto max-h-80 text-xs font-mono">
		<table class="w-full">
			<thead class="bg-gray-100 sticky top-0">
				<tr>
					<th class="px-2 py-1 text-left">Step</th>
					<th class="px-2 py-1 text-left">Block</th>
					<th class="px-2 py-1 text-center" colspan="3">Direct-Mapped</th>
					<th class="px-2 py-1 text-center border-l-2 border-gray-300" colspan="3">Fully Associative</th>
					<th class="px-2 py-1 text-left">Explanation</th>
				</tr>
				<tr class="bg-gray-50">
					<th></th>
					<th></th>
					<th class="px-2 py-0.5 text-center font-normal">H/M</th>
					<th class="px-2 py-0.5 text-center font-normal">Line</th>
					<th class="px-2 py-0.5 text-center font-normal">Tag</th>
					<th class="px-2 py-0.5 text-center font-normal border-l-2 border-gray-300">H/M</th>
					<th class="px-2 py-0.5 text-center font-normal">Line</th>
					<th class="px-2 py-0.5 text-center font-normal">Tag</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each dmTrace as dmEntry, i (dmEntry.step)}
					{@const faEntry = faTrace[i]}
					{@const isActive = dmEntry.step === currentStep}
					<tr
						class="border-t {isActive ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}"
						in:fly={{ y: 20, duration: 200, easing: quintOut }}
					>
						<td class="px-2 py-1 text-gray-500">{dmEntry.step}</td>
						<td class="px-2 py-1 font-semibold">{dmEntry.memoryBlock}</td>
						<td class="px-2 py-1 text-center">
							<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold {dmEntry.isHit ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
								{dmEntry.isHit ? 'HIT' : 'MISS'}
							</span>
						</td>
						<td class="px-2 py-1 text-center text-gray-600">{dmEntry.cacheLineIndex}</td>
						<td class="px-2 py-1 text-center text-gray-600">{dmEntry.tag}</td>
						<td class="px-2 py-1 text-center border-l-2 border-gray-300">
							<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold {faEntry.isHit ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
								{faEntry.isHit ? 'HIT' : 'MISS'}
							</span>
						</td>
						<td class="px-2 py-1 text-center text-gray-600">{faEntry.cacheLineIndex}</td>
						<td class="px-2 py-1 text-center text-gray-600">{faEntry.tag}</td>
						<td class="px-2 py-1 text-gray-500 max-w-[200px] truncate" title={dmEntry.explanation}>
							{dmEntry.explanation}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
