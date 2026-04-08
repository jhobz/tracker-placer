<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte'
	import { appState } from '$lib/state.svelte'

	interface Props {
		showExportModal: boolean
	}

	let { showExportModal = $bindable() }: Props = $props()
</script>

<header
	class="col-span-full flex items-center justify-between border-b border-base-300 bg-base-200 px-4 py-2"
>
	<div class="flex items-center gap-2">
		<svg class="w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 15V5m0 0L9 7"
			/>
		</svg>
		<h1 class="font-bold">Tracker Placer</h1>
		<span class="hidden text-xs text-base-content/40 sm:block">Poptracker Pack Map Builder</span>
	</div>

	<div class="flex items-center gap-2">
		<!-- Place mode toggle -->
		{#if appState.selectedMap?.imageFile}
			<button
				class={{
					'btn btn-sm btn-accent': true,
					'btn-active': appState.placingMode
				}}
				onclick={() => (appState.placingMode = !appState.placingMode)}
				title={appState.placingMode
					? 'Click on map to place a location box (click again to cancel)'
					: 'Enter placement mode to add location boxes'}
			>
				<svg class="w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				{appState.placingMode ? 'Placing...' : 'Place Box'}
			</button>
		{/if}

		<!-- Export -->
		<button
			class="btn btn-sm btn-primary"
			onclick={() => (showExportModal = true)}
			disabled={appState.maps.length === 0}
		>
			<svg class="w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			Export JSON
		</button>

		<ThemeToggle />
	</div>
</header>
