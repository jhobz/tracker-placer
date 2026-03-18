<script lang="ts">
	import { appState } from '$lib/state.svelte.js';
	import LocationEditor from './LocationEditor.svelte';

	let map = $derived(appState.selectedMap);
	let box = $derived(appState.selectedBox);
</script>

{#if box && map}
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h2 class="text-base-content/70 text-xs font-semibold uppercase tracking-wider">
				Location Box
			</h2>
			<button
				class="btn btn-ghost btn-xs text-error"
				onclick={() => appState.removeLocationBox(map!.id, box!.id)}
				title="Delete this location box"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</button>
		</div>

		<!-- Position display -->
		<div class="bg-base-200 flex gap-4 rounded-lg p-3">
			<div class="flex flex-col">
				<span class="text-xs opacity-50">X</span>
				<span class="font-mono text-sm font-bold">{Math.round(box.x)}</span>
			</div>
			<div class="flex flex-col">
				<span class="text-xs opacity-50">Y</span>
				<span class="font-mono text-sm font-bold">{Math.round(box.y)}</span>
			</div>
		</div>

		<!-- Size overrides -->
		<div class="flex flex-col gap-2">
			<span class="text-xs font-medium opacity-70">Size Override</span>
			<div class="flex gap-2">
				<label class="form-control flex-1">
					<div class="label py-0">
						<span class="label-text text-xs">Size</span>
						<span class="label-text-alt text-xs opacity-50">0=map default</span>
					</div>
					<input
						type="number"
						class="input input-bordered input-xs w-full"
						bind:value={box.size}
						min="0"
						max="256"
					/>
				</label>
			</div>
			<div class="flex gap-2">
				<label class="form-control flex-1">
					<div class="label py-0">
						<span class="label-text text-xs">Rect Width</span>
						<span class="label-text-alt text-xs opacity-50">0=square</span>
					</div>
					<input
						type="number"
						class="input input-bordered input-xs w-full"
						bind:value={box.rectWidth}
						min="0"
					/>
				</label>
				<label class="form-control flex-1">
					<div class="label py-0">
						<span class="label-text text-xs">Rect Height</span>
						<span class="label-text-alt text-xs opacity-50">0=square</span>
					</div>
					<input
						type="number"
						class="input input-bordered input-xs w-full"
						bind:value={box.rectHeight}
						min="0"
					/>
				</label>
			</div>
		</div>

		<div class="divider my-0"></div>

		<!-- Locations within this box -->
		<LocationEditor locations={box.locations} />
	</div>
{:else}
	<div class="flex flex-col items-center justify-center gap-3 py-8">
		<svg class="text-base-content/20 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
		<p class="text-base-content/40 text-center text-sm">
			Click a location box on the map<br />to edit its properties
		</p>
	</div>
{/if}
