<script lang="ts">
	import TrashIcon from './icons/TrashIcon.svelte'

	import { appState } from '$lib/state.svelte'
	import LocationEditor from './LocationEditor.svelte'

	const map = $derived(appState.selectedMap)
	const box = $derived(appState.selectedBox)
</script>

{#if box && map}
	<div class="flex flex-col gap-2">
		<div class="flex justify-between">
			<h2 class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">
				Location Box
			</h2>
			<button
				class="btn btn-square btn-ghost btn-xs btn-error"
				onclick={() => appState.removeLocationBox(map.id, box.id)}
				title="Delete this location box"
			>
				<TrashIcon />
			</button>
		</div>

		<!-- Position display -->
		<div class="flex justify-center gap-4 rounded-field bg-base-300 p-3">
			<div class="flex flex-col items-center">
				<span class="text-xs text-base-content/50">X</span>
				<span class="font-mono text-sm font-bold">{Math.round(box.x)}</span>
			</div>
			<div class="flex flex-col items-center">
				<span class="text-xs text-base-content/50">Y</span>
				<span class="font-mono text-sm font-bold">{Math.round(box.y)}</span>
			</div>
		</div>

		<!-- Size overrides -->
		<span class="text-xs font-medium text-base-content/70">Size Override</span>
		<label>
			<div class="label py-0">
				<span class="label-text text-xs">Size</span>
				<span class="label-text-alt text-xs opacity-50">0=map default</span>
			</div>
			<input
				type="number"
				class="input-bordered input input-xs w-full"
				bind:value={box.size}
				min="0"
				max="256"
			/>
		</label>
		<div class="flex gap-2">
			<label>
				<div class="label py-0">
					<span class="label-text text-xs">Rect Width</span>
					<span class="label-text-alt text-xs opacity-50">0=square</span>
				</div>
				<input
					type="number"
					class="input-bordered input input-xs w-full"
					bind:value={box.rectWidth}
					min="0"
				/>
			</label>
			<label>
				<div class="label py-0">
					<span class="label-text text-xs">Rect Height</span>
					<span class="label-text-alt text-xs opacity-50">0=square</span>
				</div>
				<input
					type="number"
					class="input-bordered input input-xs w-full"
					bind:value={box.rectHeight}
					min="0"
				/>
			</label>
		</div>

		<div class="divider"></div>

		<!-- Locations within this box -->
		<LocationEditor locations={box.locations} />
	</div>
{:else}
	<div class="my-8 flex flex-col place-items-center gap-2 text-center text-sm text-base-content/40">
		<svg class="w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<p>Click a location box on the map<br />to edit its properties</p>
	</div>
{/if}
