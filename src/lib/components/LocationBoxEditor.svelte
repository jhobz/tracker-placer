<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import LocationEditor from './LocationEditor.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'

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
				title="Delete location box"
				aria-label="Delete location box"
			>
				<MaterialSymbol size="sm" deemphasis>delete</MaterialSymbol>
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

		<!-- Shape overrides -->
		<span class="text-xs font-medium text-base-content/70">Shape Overrides</span>
		<label>
			<div class="label py-0">
				<span class="label-text text-xs">Size</span>
				<span class="label-text-alt text-xs opacity-50">0=map default</span>
			</div>
			<input
				type="number"
				class="input-bordered input input-xs"
				bind:value={box.size}
				min={-1}
				max={256}
				step={1}
			/>
		</label>
		<span class="text-xs text-base-content/40">More shape overrides coming soon.</span>

		<div class="divider"></div>

		<!-- Locations within this box -->
		<LocationEditor locations={box.locations} />
	</div>
{:else}
	<div class="my-8 flex flex-col place-items-center gap-2 text-center text-sm text-base-content/40">
		<MaterialSymbol size="4xl" emphasis>not_listed_location</MaterialSymbol>
		<p>Click a location box on the map<br />to edit its properties</p>
	</div>
{/if}
