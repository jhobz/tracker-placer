<script lang="ts">
	import type { Location } from '$lib/types'
	import MaterialSymbol from '../MaterialSymbol.svelte'
	import { getLocationsTabContext } from './LocationsTabContext.svelte'

	type Props = {
		locations: Location[] | null
		readonly?: boolean
	}
	let { locations, readonly = false }: Props = $props()

	const context = $derived(readonly ? null : getLocationsTabContext())
</script>

<div>
	{#if locations && locations.length > 0}
		<ul class="list">
			{#each locations as location}
				<li class="list-row items-center py-0">
					<a role="menuitem" href={undefined}>{location.name}</a>
					<div></div>
					{#if !readonly && context}
						<button
							class="btn btn-square btn-ghost"
							onclick={() => {
								if (!location.name) {
									return
								}
								context.walkDownPath(location)
							}}
							aria-label="View location details"
						>
							<MaterialSymbol>chevron_forward</MaterialSymbol>
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-base-content/50 italic">No locations found</p>
	{/if}

	{#if !readonly && context}
		<button
			class="btn btn-ghost btn-sm"
			onclick={() => context?.addChildLocation()}
			aria-label="Add location"
		>
			<MaterialSymbol size="sm">add</MaterialSymbol>
			Add location
		</button>
	{/if}
</div>

<style>
</style>
