<script lang="ts">
	// This has to be in its own group or for some reason some linter adds an extra ending bracket erroneously
	import pkg from '../../package.json' with { type: 'json' }

	import ExportModal from '$lib/components/ExportModal.svelte'
	import Header from '$lib/components/Header.svelte'
	import LocationBoxEditor from '$lib/components/LocationBoxEditor.svelte'
	import MapCanvas from '$lib/components/MapCanvas.svelte'
	import MapProperties from '$lib/components/MapProperties.svelte'
	import MapTabs from '$lib/components/MapTabs.svelte'
	import MapUpload from '$lib/components/MapUpload.svelte'
	import MaterialSymbol from '$lib/components/MaterialSymbol.svelte'
	import PackList from '$lib/components/PackList.svelte'
	import { appState } from '$lib/state.svelte'

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
	<aside class="flex flex-col justify-between border-r border-base-300 bg-base-200">
		<PackList />
		<p class="mb-2 text-center font-mono text-xs text-base-content/20">
			v{pkg.version}
		</p>
	</aside>

	<!-- Main layout -->
	<main class="relative grid grid-rows-[auto_minmax(0,1fr)]">
		<MapTabs onUploadNew={() => (showUploadModal = true)} />

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
			<input
				type="radio"
				name="right-tab"
				class="tab ml-2"
				bind:group={rightTab}
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
						<button class="btn btn-sm btn-primary" onclick={() => (showUploadModal = true)}>
							Add map
						</button>
					</div>
				{/if}
			</div>

			<input
				type="radio"
				name="right-tab"
				class="tab"
				bind:group={rightTab}
				value="box"
				aria-label="Locations"
			/>
			<div
				class="tab-content overflow-y-auto rounded-none border-l-0 border-base-300 bg-base-100 p-4 pr-1 [scrollbar-gutter:stable]"
			>
				<LocationBoxEditor />
			</div>
		</div>

		<div class="">
			{#if rightTab === 'map'}{:else}{/if}
		</div>
	</aside>

	<!-- Upload modal -->
	{#if showUploadModal}
		<div class="modal-open modal" role="dialog" aria-modal="true">
			<div class="modal-box">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-bold">Add Map Images</h3>
					<button class="btn btn-circle btn-ghost btn-sm" onclick={() => (showUploadModal = false)}>
						<MaterialSymbol>close</MaterialSymbol>
					</button>
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
