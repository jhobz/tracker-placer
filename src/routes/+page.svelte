<script lang="ts">
	import { dev, version } from '$app/environment'
	import ExportModal from '$lib/components/ExportModal.svelte'
	import Header from '$lib/components/Header.svelte'
	import ImportModal from '$lib/components/ImportModal.svelte'
	import LocationBoxEditor from '$lib/components/LocationBoxEditor.svelte'
	import LocationsTab from '$lib/components/LocationsTab/LocationsTab.svelte'
	import {
		LocationsTabContext,
		setLocationsTabContext
	} from '$lib/components/LocationsTab/LocationsTabContext.svelte'
	import MapCanvas from '$lib/components/MapCanvas.svelte'
	import MapProperties from '$lib/components/MapProperties.svelte'
	import MapTabs from '$lib/components/MapTabs.svelte'
	import MapUpload from '$lib/components/MapUpload.svelte'
	import MaterialSymbol from '$lib/components/MaterialSymbol.svelte'
	import PackList from '$lib/components/PackList.svelte'
	import { appState } from '$lib/state.svelte'

	let showMapUploadModal = $state(false)
	let showExportModal = $state(false)
	let showImportModal = $state(false)

	const locationsTabContext = new LocationsTabContext()
	setLocationsTabContext(locationsTabContext)
</script>

<div
	data-theme={appState.theme}
	class="grid h-screen grid-cols-[13rem_minmax(0,1fr)_26rem] grid-rows-[auto_minmax(0,1fr)] bg-base-100 text-base-content"
>
	<!-- Top bar -->
	<Header bind:showExportModal />

	<!-- Left sidebar: pack list -->
	<aside class="flex flex-col border-r border-base-300 bg-base-200">
		<PackList />
		<button
			class="btn self-center btn-ghost btn-secondary"
			onclick={() => (showImportModal = true)}
		>
			<MaterialSymbol>drive_folder_upload</MaterialSymbol>
			Import pack
		</button>
		<p class="mt-auto mb-2 text-center font-mono text-xs text-base-content/20">
			v{version}{dev ? '-dev' : ''}
		</p>
	</aside>

	<!-- Main layout -->
	<main class="relative grid grid-rows-[auto_minmax(0,1fr)]">
		<MapTabs onUploadNew={() => (showMapUploadModal = true)} />

		{#if appState.placingMode}
			<div class="absolute top-0 left-[50%] z-10 my-4 alert -translate-x-[50%] alert-info">
				<MaterialSymbol>info</MaterialSymbol>
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
	<aside class="h-full border-l border-base-300 bg-base-200">
		<!-- Tab switcher -->
		<div class="tabs-lift tabs h-full pt-2 tabs-sm">
			<!-- Map -->
			<input
				type="radio"
				name="right-tab"
				class="tab ml-2"
				bind:group={appState.currentTab}
				value="map"
				aria-label="Map"
			/>
			<div
				class="tab-content overflow-y-auto rounded-none border-l-0 border-base-300 bg-base-100 p-4 pr-1 [scrollbar-gutter:stable]"
			>
				{#if appState.selectedMap}
					<MapProperties />
				{:else}
					<div class="flex flex-col items-center justify-center gap-2 py-8 text-base-content/40">
						<MaterialSymbol size="4xl" deemphasis>map</MaterialSymbol>
						<p class="text-center text-sm">
							No map selected.<br />Add a map to get started.
						</p>
						<button class="btn btn-sm btn-primary" onclick={() => (showMapUploadModal = true)}>
							Add map
						</button>
					</div>
				{/if}
			</div>

			<!-- Locations -->
			<input
				type="radio"
				name="right-tab"
				class="tab"
				bind:group={appState.currentTab}
				value="locations"
				aria-label="Locations"
			/>
			<div
				class="tab-content overflow-y-auto rounded-none border-l-0 border-base-300 bg-base-100 p-4 pr-1 [scrollbar-gutter:stable]"
			>
				<LocationsTab />
			</div>

			<!-- Box -->
			{#if appState.selectedMap && appState.selectedBox}
				<input
					type="radio"
					name="right-tab"
					class="tab mr-2 ml-auto"
					bind:group={appState.currentTab}
					value="box"
					aria-label="Box"
				/>
				<div
					class="tab-content overflow-y-auto rounded-none border-l-0 border-base-300 bg-base-100 p-4 pr-1 [scrollbar-gutter:stable]"
				>
					<LocationBoxEditor map={appState.selectedMap} box={appState.selectedBox} />
				</div>
			{/if}
		</div>
	</aside>

	<!-- Upload modal -->
	{#if showMapUploadModal}
		<div class="modal-open modal" role="dialog" aria-modal="true">
			<div class="modal-box">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-bold">Add Map Images</h3>
					<button
						class="btn btn-circle btn-ghost btn-sm"
						onclick={() => (showMapUploadModal = false)}
					>
						<MaterialSymbol>close</MaterialSymbol>
					</button>
				</div>
				<MapUpload onupload={() => (showMapUploadModal = false)} />
				<div class="modal-action">
					<button class="btn" onclick={() => (showMapUploadModal = false)}>Done</button>
				</div>
			</div>
			<div
				class="modal-backdrop"
				role="button"
				tabindex="0"
				onclick={() => (showMapUploadModal = false)}
				onkeydown={(e) => e.key === 'Escape' && (showMapUploadModal = false)}
			></div>
		</div>
	{/if}

	<!-- Export modal -->
	<ExportModal open={showExportModal} onclose={() => (showExportModal = false)} />

	<!-- Import modal -->
	<ImportModal open={showImportModal} onclose={() => (showImportModal = false)} />
</div>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && appState.placingMode) {
			appState.placingMode = false
		}
	}}
/>
