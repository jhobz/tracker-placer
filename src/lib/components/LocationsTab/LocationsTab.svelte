<script lang="ts">
	import MaterialSymbol from '../MaterialSymbol.svelte'
	import LocationEditor from './LocationEditor.svelte'
	import LocationList from './LocationList.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	const context = new LocationsTabContext()
	setLocationsTabContext(context)

	const pathSegments = $derived(context.path.split('/').filter(Boolean))
</script>

<div>
	{#if !context.path}
		<p class="mb-4 alert text-xs alert-info">
			<MaterialSymbol size="sm">info</MaterialSymbol>
			Manage all locations in the pack. You can also manage locations within individual location boxes
			on the map.
		</p>
	{/if}

	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<a role="button" href={undefined} onclick={() => context.walkUpPath(-1)}>Locations</a>
			</li>
			{#each pathSegments as part, i}
				<li>
					<a
						role="button"
						href={undefined}
						onclick={() => context.walkUpPath(pathSegments.length - i - 1)}
					>
						{part}
					</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if context.currentLocation}
		<LocationEditor bind:location={context.currentLocation} />
	{:else}
		<LocationList locations={context.currentChildren} />
	{/if}
</div>

<style>
</style>
