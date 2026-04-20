<script lang="ts">
	import type { Location } from '$lib/types'
	import MaterialSymbol from '../MaterialSymbol.svelte'
	import { getLocationsTabContext } from './LocationsTabContext.svelte'

	const context = getLocationsTabContext()

	type Props = {
		locations: Location[] | null
	}
	let { locations }: Props = $props()
</script>

<div>
	{#if locations}
		<ul class="list">
			{#each locations as location}
				<li class="list-row items-center py-0">
					<a role="menuitem" href={undefined}>{location.name}</a>
					<div></div>
					<button
						class="btn btn-square btn-ghost"
						onclick={() => {
							if (!location.name) {
								return
							}
							context.appendToPath(location.name)
						}}
						aria-label="View location details"
					>
						<MaterialSymbol>chevron_forward</MaterialSymbol>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-base-content/50 italic">No locations found</p>
	{/if}
</div>

<style>
</style>
