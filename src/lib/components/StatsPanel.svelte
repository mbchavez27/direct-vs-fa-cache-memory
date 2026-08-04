<script lang="ts">
	import type { SimulationStatistics } from '$lib/cache/types';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';

	let { stats, label, didSkip = false }: {
		stats: SimulationStatistics;
		label: string;
		didSkip?: boolean;
	} = $props();

	const tweenedHits = tweened(0, { duration: 200, easing: quintOut });
	const tweenedMisses = tweened(0, { duration: 200, easing: quintOut });
	const tweenedHitRate = tweened(0, { duration: 200, easing: quintOut });
	const tweenedMissRate = tweened(0, { duration: 200, easing: quintOut });
	const tweenedAMAT = tweened(0, { duration: 200, easing: quintOut });
	const tweenedTotalTime = tweened(0, { duration: 200, easing: quintOut });

	$effect(() => {
		const dur = didSkip ? 50 : 200;
		tweenedHits.set(stats.hits, { duration: dur });
		tweenedMisses.set(stats.misses, { duration: dur });
		tweenedHitRate.set(stats.hitRate * 100, { duration: dur });
		tweenedMissRate.set(stats.missRate * 100, { duration: dur });
		tweenedAMAT.set(stats.averageMemoryAccessTimeNs, { duration: dur });
		tweenedTotalTime.set(stats.totalMemoryAccessTimeNs, { duration: dur });
	});
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 text-sm">
	<h3 class="font-semibold text-gray-700 mb-2">{label}</h3>
	<div class="grid grid-cols-2 gap-x-4 gap-y-1">
		<div class="flex justify-between">
			<span class="text-gray-500">Hits:</span>
			<span class="font-mono text-green-600 font-semibold">{$tweenedHits}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Misses:</span>
			<span class="font-mono text-red-600 font-semibold">{$tweenedMisses}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Hit Rate:</span>
			<span class="font-mono font-semibold">{$tweenedHitRate.toFixed(1)}%</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Miss Rate:</span>
			<span class="font-mono font-semibold">{$tweenedMissRate.toFixed(1)}%</span>
		</div>
		<div class="col-span-2 flex justify-between border-t border-gray-100 pt-1 mt-1">
			<span class="text-gray-500">AMAT:</span>
			<span class="font-mono font-bold text-blue-700">{$tweenedAMAT.toFixed(2)} ns</span>
		</div>
		<div class="col-span-2 flex justify-between border-t border-gray-100 pt-1 mt-1">
			<span class="text-gray-500">Total Access Time:</span>
			<span class="font-mono font-bold text-blue-700">{$tweenedTotalTime.toFixed(2)} ns</span>
		</div>
	</div>
</div>
