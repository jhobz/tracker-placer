<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte'
	import { appState } from '$lib/state.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'

	interface Props {
		showExportModal: boolean
	}

	let { showExportModal = $bindable() }: Props = $props()
</script>

<header
	class="col-span-full flex items-center justify-between border-b border-base-300 bg-base-300 px-4 py-2"
>
	<div class="flex items-center gap-2">
		<MaterialSymbol class="text-primary" size="xl" emphasis>map</MaterialSymbol>
		<h1 class="font-bold">Tracker Placer</h1>
		<span class="hidden text-xs text-base-content/40 sm:block">Poptracker Pack Map Builder</span>
	</div>

	<div class="flex items-center gap-2">
		<!-- Place mode toggle -->
		{#if appState.selectedMap?.imageFile}
			<button
				class={{
					'btn btn-sm btn-accent': true,
					'btn-active btn-secondary': appState.placingMode
				}}
				onclick={() => (appState.placingMode = !appState.placingMode)}
				title={appState.placingMode
					? 'Click on map to place a location box (click again to cancel)'
					: 'Enter placement mode to add location boxes'}
			>
				<MaterialSymbol>add_location</MaterialSymbol>
				{appState.placingMode ? 'Placing...' : 'Place Box'}
			</button>
		{/if}

		<!-- Export -->
		<button
			class="btn btn-sm btn-primary"
			onclick={() => (showExportModal = true)}
			disabled={appState.maps.length === 0}
		>
			<MaterialSymbol>download</MaterialSymbol>
			Export JSON
		</button>

		<ThemeToggle />
	</div>
</header>
