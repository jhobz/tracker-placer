<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import type { Location } from '$lib/types'
	import { getAllLocations } from '$lib/utils/locations'
	import { slide } from 'svelte/transition'

	interface Props {
		onSelect: (location: Location) => void
	}

	let { onSelect }: Props = $props()

	let searchQuery = $state('')
	const locations = $derived(getAllLocations(appState.selectedPack?.locations ?? []))
	const searchResults = $derived(
		locations.filter((loc) => loc.name?.toLowerCase().includes(searchQuery.toLowerCase()))
	)
</script>

<input
	type="search"
	placeholder="Search existing locations..."
	aria-label="Search existing locations..."
	class="input w-full input-secondary"
	list="location-search-results"
	bind:value={searchQuery}
/>
{#if searchQuery && searchResults.length > 0}
	<ul
		class="menu -mt-2 max-h-50 w-full flex-nowrap gap-2 overflow-y-auto menu-xs rounded-b-box border border-t-0 border-secondary bg-base-100"
		role="menu"
	>
		{#each searchResults as loc (loc.name)}
			<li role="menuitem" transition:slide>
				<a
					href={undefined}
					role="button"
					onclick={() => onSelect(loc)}
					class="flex justify-start gap-0">{loc.name}</a
				>
			</li>
		{/each}
	</ul>
{/if}
