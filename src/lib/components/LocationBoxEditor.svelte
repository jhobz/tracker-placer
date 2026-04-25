<script lang="ts">
	import MaterialSymbol from '$lib/components/MaterialSymbol.svelte'
	import { appState, createLocation } from '$lib/state.svelte'
	import type { Location, MapLocation } from '$lib/types'
	import { findLocation, findLocationByMapLocation } from '$lib/utils/locations'
	import LocationSearchBox from './LocationSearchBox.svelte'
	import { getLocationsTabContext } from './LocationsTab/LocationsTabContext.svelte'

	interface Props {
		box: MapLocation
	}

	let { box }: Props = $props()

	const locationsTabContext = getLocationsTabContext()

	const location = $derived(
		box &&
			appState.selectedPack?.locations &&
			findLocationByMapLocation(appState.selectedPack?.locations, box)
	)

	function addLocation() {
		const loc = createLocation()
		loc.map_locations = [box]
		appState.selectedPack?.locations.push(loc)
	}

	function setLocation(location: Location) {
		if (!box) {
			return
		}

		if (!location.map_locations) {
			location.map_locations = []
		}

		if (location.map_locations.some((ml) => ml === box)) {
			return
		}

		location.map_locations.push(box)
	}

	function clearLocation() {
		if (!box || !location?.map_locations) {
			return
		}

		location.map_locations = location.map_locations.filter((ml) => ml !== box)
	}

	function editLocation() {
		if (!box || !location) {
			return
		}

		appState.currentTab = 'locations'
		locationsTabContext.currentLocation = location
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between">
		<h2 class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">
			Location Box
		</h2>
		<button
			class="btn btn-square btn-ghost btn-xs btn-error"
			onclick={() => appState.removeLocationBox(box)}
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
			<span class="font-mono text-sm font-bold">{Math.round(box.x ?? -1)}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="text-xs text-base-content/50">Y</span>
			<span class="font-mono text-sm font-bold">{Math.round(box.y ?? -1)}</span>
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

	{#if location}
		{@const [_, path] = findLocation(appState.selectedPack?.locations ?? [], location)}

		<!-- Controls -->
		<div class="flex items-center justify-between text-sm">
			<span class="font-medium">Location</span>
			<div>
				<div class="tooltip tooltip-left tooltip-secondary" data-tip="Edit location">
					<button
						class="btn btn-square btn-soft btn-xs btn-secondary"
						onclick={editLocation}
						aria-label="Edit location"
					>
						<MaterialSymbol size="sm">edit</MaterialSymbol>
					</button>
				</div>
				<div class="tooltip tooltip-left tooltip-warning" data-tip="Clear location">
					<button
						class="btn btn-square btn-soft btn-xs btn-warning"
						onclick={clearLocation}
						aria-label="Clear location"
					>
						<MaterialSymbol size="sm">remove</MaterialSymbol>
					</button>
				</div>
			</div>
		</div>

		<!-- Location details -->
		<div class="grid grid-cols-[auto_1fr] gap-2 text-sm *:odd:text-end *:odd:text-base-content/50">
			<span>Name</span>
			<span>{location.name}</span>

			<span>Path</span>
			<span class="text-base-content/50">{path}</span>

			<span>Sections</span>
			<div class="flex flex-col gap-1">
				{#each location.sections as section}
					<span>{section.name}</span>
				{/each}
			</div>
		</div>
		<div class="flex gap-2"></div>
	{:else}
		<div class="card border border-base-300 bg-base-200">
			<div class="card-body">
				<LocationSearchBox onSelect={setLocation} />
				<div class="divider font-medium">OR</div>
				<button
					class="btn self-center btn-ghost btn-secondary"
					onclick={addLocation}
					aria-label="Add a new location"
				>
					<MaterialSymbol>add</MaterialSymbol>
					Add a new location
				</button>
			</div>
		</div>
	{/if}
</div>
