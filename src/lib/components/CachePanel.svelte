<script lang="ts">
	import type { CacheLine, SimulationStatistics } from '$lib/cache/types';
	import CacheGrid from './CacheGrid.svelte';
	import StatsPanel from './StatsPanel.svelte';

	let { title, lines, stats, highlightedLine = -1, hitLine = -1, evictionLine = -1, showLastUsed = false }: {
		title: string;
		lines: CacheLine[];
		stats: SimulationStatistics;
		highlightedLine?: number;
		hitLine?: number;
		evictionLine?: number;
		showLastUsed?: boolean;
	} = $props();
</script>

<div class="flex flex-col gap-2">
	<h2 class="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
	<CacheGrid
		{lines}
		{highlightedLine}
		{hitLine}
		{evictionLine}
		{showLastUsed}
	/>
	<StatsPanel {stats} label="Statistics" />
</div>
