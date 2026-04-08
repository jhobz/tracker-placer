<script lang="ts">
	import Header from '$lib/components/Header.svelte'
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
	<Header bind:showExportModal />

	<!-- Left sidebar: pack list -->
	<aside class="border-r border-base-300 bg-base-200">
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

		<div class="p-4">
			<MapCanvas />
		</div>
	</main>

	<!-- Right sidebar: properties -->
	<aside class="flex flex-col border-l border-base-300 bg-base-200">
		<!-- Tab switcher -->
		<div class="tabs-lift tabs px-3 pt-2">
			<button
				class={{ 'tab-sm tab': true, 'tab-active': rightTab === 'map' }}
				onclick={() => (rightTab = 'map')}
			>
				Map
			</button>
			<button
				class={{ 'tab-sm tab': true, 'tab-active': rightTab === 'box' }}
				onclick={() => (rightTab = 'box')}
			>
				Locations
			</button>
		</div>

		<div class="flex-1 overflow-y-auto bg-base-100 p-4 pr-1 [scrollbar-gutter:stable]">
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
