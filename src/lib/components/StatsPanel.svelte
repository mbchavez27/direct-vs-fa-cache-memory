<script lang="ts">
	import type { SimulationStatistics } from '$lib/cache/types';

	let { stats, label }: {
		stats: SimulationStatistics;
		label: string;
	} = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 text-sm">
	<h3 class="font-semibold text-gray-700 mb-2">{label}</h3>
	<div class="grid grid-cols-2 gap-x-4 gap-y-1">
		<div class="flex justify-between">
			<span class="text-gray-500">Hits:</span>
			<span class="font-mono text-green-600 font-semibold">{stats.hits}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Misses:</span>
			<span class="font-mono text-red-600 font-semibold">{stats.misses}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Hit Rate:</span>
			<span class="font-mono font-semibold">{(stats.hitRate * 100).toFixed(1)}%</span>
		</div>
		<div class="flex justify-between">
			<span class="text-gray-500">Miss Rate:</span>
			<span class="font-mono font-semibold">{(stats.missRate * 100).toFixed(1)}%</span>
		</div>
		<div class="col-span-2 flex justify-between border-t border-gray-100 pt-1 mt-1">
			<span class="text-gray-500">AMAT:</span>
			<span class="font-mono font-bold text-blue-700">{stats.averageMemoryAccessTimeNs.toFixed(2)} ns</span>
		</div>
	</div>
</div>
