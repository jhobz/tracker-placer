<script lang="ts">
	import LocationList from './LocationList.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	const context = new LocationsTabContext()
	setLocationsTabContext(context)

	const locations = $derived(context.locations)
</script>

<div>
	<p class="mb-4 text-sm text-base-content/70">
		Manage all locations in the pack. You can also manage locations within individual location boxes
		on the map.
	</p>

	<div class="breadcrumbs text-sm">
		<ul>
			<li>Locations</li>
			{#each context.path.split('/').filter(Boolean) as part}
				<li>
					{part}
				</li>
			{/each}
		</ul>
	</div>

	{#if context.currentLocation}
		<div>currentLocation: {context.currentLocation.name}</div>
	{/if}

	<LocationList locations={context.locations} />
</div>

<style>
</style>
