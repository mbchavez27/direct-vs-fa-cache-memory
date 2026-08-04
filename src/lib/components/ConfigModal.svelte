<script lang="ts">
	import type { CacheConfig } from '$lib/cache/types';
	import { validateConfiguration } from '$lib/cache/validation';

	let {
		config = $bindable({} as CacheConfig),
		open = $bindable(false),
		onApply = () => {},
	}: {
		config: CacheConfig;
		open: boolean;
		onApply: () => void;
	} = $props();

	let localConfig = $state({ ...config });
	let validationErrors = $state<string[]>([]);

	$effect(() => {
		if (!open) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				handleCancel();
			}
		}

		window.addEventListener('keydown', onKeyDown);
		document.getElementById('config-dialog')?.focus();

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	function validate(): boolean {
		validationErrors = validateConfiguration(localConfig);
		return validationErrors.length === 0;
	}

	function handleApply() {
		if (!validate()) return;
		config = { ...localConfig };
		onApply();
		open = false;
		validationErrors = [];
	}

	function handleCancel() {
		localConfig = { ...config };
		validationErrors = [];
		open = false;
	}

	function getErrorForField(field: string): string | null {
		return validationErrors.find((e) => e.toLowerCase().includes(field.toLowerCase())) ?? null;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onclick={handleCancel} role="presentation">
		<div
			id="config-dialog"
			class="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-label="Cache Configuration"
			tabindex="-1"
		>
			<h2 class="text-lg font-bold text-gray-800 mb-4">Cache Configuration</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="flex flex-col gap-1">
					<label for="block-size" class="text-xs font-medium text-gray-600">Block Size (words)</label>
					<input
						id="block-size"
						type="number"
						bind:value={localConfig.blockSizeWords}
						min="2"
						class="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
					/>
					{#if getErrorForField('block size')}
						<span class="text-[11px] text-red-500">{getErrorForField('block size')}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<label for="cache-blocks" class="text-xs font-medium text-gray-600">Cache Blocks</label>
					<input
						id="cache-blocks"
						type="number"
						bind:value={localConfig.cacheBlockCount}
						min="4"
						class="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
					/>
					{#if getErrorForField('cache block')}
						<span class="text-[11px] text-red-500">{getErrorForField('cache block')}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<label for="read-policy" class="text-xs font-medium text-gray-600">Read Policy</label>
					<select
						id="read-policy"
						bind:value={localConfig.readPolicy}
						class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
					>
						<option value="load-through">Load-through</option>
						<option value="non-load-through">Non-load-through</option>
					</select>
				</div>

				<div class="flex flex-col gap-1">
					<label for="cache-time" class="text-xs font-medium text-gray-600">Cache Access (ns)</label>
					<input
						id="cache-time"
						type="number"
						bind:value={localConfig.cacheAccessTimeNs}
						min="1"
						class="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
					/>
					{#if getErrorForField('cache access')}
						<span class="text-[11px] text-red-500">{getErrorForField('cache access')}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<label for="memory-time" class="text-xs font-medium text-gray-600">Memory Access (ns)</label>
					<input
						id="memory-time"
						type="number"
						bind:value={localConfig.memoryAccessTimeNs}
						min="1"
						class="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
					/>
					{#if getErrorForField('memory access')}
						<span class="text-[11px] text-red-500">{getErrorForField('memory access')}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<label for="main-memory" class="text-xs font-medium text-gray-600">Main Memory Blocks</label>
					<input
						id="main-memory"
						type="number"
						bind:value={localConfig.mainMemoryBlockCount}
						disabled
						class="border border-gray-200 rounded px-2 py-1.5 text-sm font-mono bg-gray-50"
					/>
				</div>
			</div>

			{#if validationErrors.length > 0}
				<div class="mt-3 text-xs text-red-600 bg-red-50 rounded px-2 py-1.5">
					{#each validationErrors as error}
						<div>• {error}</div>
					{/each}
				</div>
			{/if}

			<div class="flex justify-end gap-2 mt-6">
				<button
					onclick={handleCancel}
					class="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleApply}
					class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
				>
					Apply
				</button>
			</div>
		</div>
	</div>
{/if}
