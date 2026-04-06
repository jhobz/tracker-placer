<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import PackList from '$lib/components/PackList.svelte'
	import MapTabs from '$lib/components/MapTabs.svelte'
	import MapUpload from '$lib/components/MapUpload.svelte'
	import MapCanvas from '$lib/components/MapCanvas.svelte'
	import MapProperties from '$lib/components/MapProperties.svelte'
	import LocationBoxEditor from '$lib/components/LocationBoxEditor.svelte'
	import ExportModal from '$lib/components/ExportModal.svelte'

	let showUploadModal = $state(false)
	let showExportModal = $state(false)

	// Right sidebar tab
	let rightTab = $state<'map' | 'box'>('map')

	// Auto-switch to box tab when a box is selected
	$effect(() => {
		if (appState.selectedBoxId) {
			rightTab = 'box'
		}
	})
</script>

<div
	data-theme={appState.theme}
	class="grid h-screen grid-cols-[13rem_minmax(0,1fr)_26rem] grid-rows-[auto_minmax(0,1fr)] bg-base-100 text-base-content"
>
	<!-- Top bar -->
	<header
		class="col-span-full flex items-center justify-between border-b border-base-300 bg-base-200 px-4 py-2"
	>
		<div class="flex items-center gap-3">
			<svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 15V5m0 0L9 7"
				/>
			</svg>
			<h1 class="text-base font-bold">Tracker Placer</h1>
			<span class="hidden text-xs text-base-content/40 sm:block">Poptracker Pack Map Builder</span>
		</div>

		<div class="flex items-center gap-2">
			<!-- Place mode toggle -->
			{#if appState.selectedMap?.imageFile}
				<button
					class="btn btn-sm {appState.placingMode ? 'btn-warning' : 'btn-outline'}"
					onclick={() => (appState.placingMode = !appState.placingMode)}
					title={appState.placingMode
						? 'Click on map to place a location box (click again to cancel)'
						: 'Enter placement mode to add location boxes'}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				Export JSON
			</button>

			<!-- Theme toggle -->
			<button
				class="btn btn-circle btn-ghost btn-sm"
				onclick={() => appState.toggleTheme()}
				title="Toggle theme"
			>
				{#if appState.theme === 'dark'}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</header>

	<!-- Left sidebar: pack list -->
	<aside class="border-r border-base-300 bg-base-200 p-3">
		<PackList />
	</aside>

	<!-- Main layout -->
	<main class="relative grid grid-rows-[auto_minmax(0,1fr)]">
		<MapTabs onUploadNew={() => (showUploadModal = true)} />

		{#if appState.placingMode}
			<div class="absolute top-0 left-[50%] z-10 my-4 alert -translate-x-[50%] alert-info">
				<svg class="w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span
					>Click anywhere on the map to place a location box. Press <kbd
						class="kbd kbd-xs text-base-content">Esc</kbd
					> to cancel.</span
				>
			</div>
		{/if}

		<MapCanvas />
	</main>

	<!-- Right sidebar: properties -->
	<aside class="flex flex-col border-l border-base-300 bg-base-200">
		<!-- Tab switcher -->
		<div class="tabs-bordered tabs px-3 pt-2">
			<button
				class="tab-sm tab {rightTab === 'map' ? 'tab-active' : ''}"
				onclick={() => (rightTab = 'map')}
			>
				Map
			</button>
			<button
				class="tab-sm tab {rightTab === 'box' ? 'tab-active' : ''}"
				onclick={() => (rightTab = 'box')}
			>
				Location
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-3">
			{#if rightTab === 'map'}
				{#if appState.selectedMap}
					<MapProperties />
				{:else}
					<div class="flex flex-col items-center justify-center gap-3 py-8">
						<svg
							class="h-12 w-12 text-base-content/20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 15V5m0 0L9 7"
							/>
						</svg>
						<p class="text-center text-sm text-base-content/40">
							No map selected.<br />Add a map to get started.
						</p>
						<button class="btn btn-sm btn-primary" onclick={() => (showUploadModal = true)}>
							Add Map
						</button>
					</div>
				{/if}
			{:else}
				<LocationBoxEditor />
			{/if}
		</div>
	</aside>

	<!-- Upload modal -->
	{#if showUploadModal}
		<div class="modal-open modal" role="dialog" aria-modal="true">
			<div class="modal-box">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-bold">Add Map Images</h3>
					<button class="btn btn-circle btn-ghost btn-sm" onclick={() => (showUploadModal = false)}
						>✕</button
					>
				</div>
				<MapUpload onupload={() => (showUploadModal = false)} />
				<div class="modal-action">
					<button class="btn" onclick={() => (showUploadModal = false)}>Done</button>
				</div>
			</div>
			<div
				class="modal-backdrop"
				role="button"
				tabindex="0"
				onclick={() => (showUploadModal = false)}
				onkeydown={(e) => e.key === 'Escape' && (showUploadModal = false)}
			></div>
		</div>
	{/if}

	<!-- Export modal -->
	<ExportModal open={showExportModal} onclose={() => (showExportModal = false)} />
</div>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && appState.placingMode) {
			appState.placingMode = false
		}
	}}
/>
