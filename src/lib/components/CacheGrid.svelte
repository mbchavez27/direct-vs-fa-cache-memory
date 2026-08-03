<script lang="ts">
	import type { CacheLine } from '$lib/cache/types';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { lines, highlightedLine = -1, hitLine = -1, evictionLine = -1, showLastUsed = false }: {
		lines: CacheLine[];
		highlightedLine?: number;
		hitLine?: number;
		evictionLine?: number;
		showLastUsed?: boolean;
	} = $props();

	function lineClasses(line: CacheLine, idx: number): string {
		if (idx === hitLine) return 'bg-green-100 border-green-400 animate-pulse-once';
		if (idx === evictionLine) return 'bg-yellow-100 border-yellow-400 animate-shake';
		if (idx === highlightedLine) return 'bg-red-50 border-red-300';
		if (!line.valid) return 'bg-gray-50 border-gray-200';
		return 'bg-white border-gray-200';
	}
</script>

<div class="overflow-auto max-h-[600px] rounded-lg border border-gray-300">
	<table class="w-full text-xs font-mono">
		<thead class="bg-gray-100 sticky top-0">
			<tr>
				<th class="px-2 py-1 text-left font-semibold">Line</th>
				<th class="px-2 py-1 text-center font-semibold">V</th>
				<th class="px-2 py-1 text-left font-semibold">Tag</th>
				<th class="px-2 py-1 text-left font-semibold">Block</th>
				{#if showLastUsed}
					<th class="px-2 py-1 text-left font-semibold">Last Used</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each lines as line, idx (line.lineIndex)}
				<tr
					class="border-t {lineClasses(line, idx)}"
					transition:scale={{ duration: 200, easing: quintOut }}
				>
					<td class="px-2 py-1 text-gray-500">{line.lineIndex}</td>
					<td class="px-2 py-1 text-center">
						{#if line.valid}
							<span class="text-green-600 font-bold">1</span>
						{:else}
							<span class="text-gray-400">0</span>
						{/if}
					</td>
					<td class="px-2 py-1">
						{line.tag !== null ? line.tag : '-'}
					</td>
					<td class="px-2 py-1">
						{line.memoryBlock !== null ? line.memoryBlock : '-'}
					</td>
					{#if showLastUsed}
						<td class="px-2 py-1 text-gray-500">
							{line.lastUsedStep > 0 ? line.lastUsedStep : '-'}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
