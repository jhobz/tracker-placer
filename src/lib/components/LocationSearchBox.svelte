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
	let highlightedIndex = $state(-1)

	const locations = $derived(getAllLocations(appState.selectedPack?.locations ?? []))
	const searchResults = $derived(
		locations.filter((loc) => loc.name?.toLowerCase().includes(searchQuery.toLowerCase()))
	)

	$effect(() => {
		if (searchResults.length === 0) {
			highlightedIndex = -1
			return
		}

		highlightedIndex = 0
	})
</script>

<input
	class="input w-full input-secondary"
	type="search"
	role="combobox"
	aria-expanded={searchResults.length > 0}
	aria-haspopup="grid"
	aria-autocomplete="list"
	aria-controls="location-search-results"
	aria-activedescendant={highlightedIndex >= 0
		? `location-search-result-${highlightedIndex}`
		: undefined}
	aria-label="Search existing locations..."
	placeholder="Search existing locations..."
	bind:value={searchQuery}
	onkeyup={(e) => {
		if (searchResults.length === 0) {
			return
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				highlightedIndex = highlightedIndex === searchResults.length - 1 ? 0 : highlightedIndex + 1
				document.getElementById(`location-search-result-${highlightedIndex}`)?.scrollIntoView({
					behavior: highlightedIndex === 0 ? 'instant' : 'smooth',
					block: 'nearest'
				})
				break
			case 'ArrowUp':
				e.preventDefault()
				highlightedIndex = highlightedIndex === 0 ? searchResults.length - 1 : highlightedIndex - 1
				document.getElementById(`location-search-result-${highlightedIndex}`)?.scrollIntoView({
					behavior: highlightedIndex === searchResults.length - 1 ? 'instant' : 'smooth',
					block: 'nearest'
				})
				break
			case 'Enter':
				e.preventDefault()
				onSelect(searchResults[highlightedIndex])
				break
		}
	}}
/>

{#if searchQuery && searchResults.length > 0}
	<div role="grid" aria-label="Location search results">
		<ul
			class="menu -mt-1 max-h-50 w-full flex-nowrap overflow-y-auto menu-xs rounded-b-field border border-t-0 border-secondary bg-base-100"
			id="location-search-results"
		>
			{#each searchResults as loc, i}
				<li transition:slide>
					<a
						role="gridcell"
						id={`location-search-result-${i}`}
						href={undefined}
						onclick={() => onSelect(loc)}
						class={{ 'flex justify-start gap-0': true, 'menu-active': highlightedIndex === i }}
						>{loc.name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
{/if}
