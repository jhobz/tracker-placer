<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import {
		downloadJson,
		exportLocationsJson,
		exportMapsJson,
		ExportValidationError
	} from '$lib/utils/export'
	import MaterialSymbol from './MaterialSymbol.svelte'

	type Props = { open: boolean; onclose: () => void }
	let { open, onclose }: Props = $props()

	let mapsJson = $derived(JSON.stringify(exportMapsJson(appState.maps, true), null, 2))
	let locationsJson = $derived(JSON.stringify(exportLocationsJson(appState.maps, true), null, 2))

	let activeTab = $state<'maps' | 'locations'>('maps')
	let validationError = $state<string | null>(null)
	let allowOverride = $state<boolean>(false)

	function tryDownloadMaps(overrideErrors = false) {
		try {
			const mapsData = exportMapsJson(appState.maps, overrideErrors)
			validationError = null
			allowOverride = false
			downloadJson('maps.json', mapsData)
		} catch (err) {
			if (err instanceof ExportValidationError && !allowOverride) {
				validationError = err.message
				return
			}
		}
	}

	function tryDownloadLocations(overrideErrors = false) {
		try {
			const locationsData = exportLocationsJson(appState.maps, overrideErrors)
			validationError = null
			allowOverride = false
			downloadJson('locations.json', locationsData)
		} catch (err) {
			if (err instanceof ExportValidationError && !allowOverride) {
				validationError = err.message
				return
			}
		}
	}

	function tryDownloadAll() {
		tryDownloadMaps()
		tryDownloadLocations()
	}

	function handleOverride() {
		allowOverride = true
		validationError = null

		if (activeTab === 'maps') {
			tryDownloadMaps(true)
			return
		}

		tryDownloadLocations(true)
	}
</script>

{#if open}
	<!-- Modal backdrop -->
	<div class="modal-open modal" role="dialog" aria-modal="true">
		<div class="modal-box max-w-3xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold">Export JSON Files</h3>
				<button class="btn btn-circle btn-ghost btn-sm" aria-label="Close" onclick={onclose}>
					<MaterialSymbol>close</MaterialSymbol>
				</button>
			</div>

			<p class="mb-4 text-sm text-base-content/60">
				Download the generated JSON files and place them in your Poptracker pack directory.
			</p>

			<div class="tabs-bordered mb-4 tabs">
				<button
					class="tab {activeTab === 'maps' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'maps')}
				>
					maps.json
				</button>
				<button
					class="tab {activeTab === 'locations' ? 'tab-active' : ''}"
					onclick={() => (activeTab = 'locations')}
				>
					locations.json
				</button>
			</div>

			<div class="relative overflow-auto rounded-lg bg-base-200">
				<pre class="max-h-96 overflow-auto p-4 font-mono text-xs">{activeTab === 'maps'
						? mapsJson
						: locationsJson}</pre>
			</div>

			<div class="modal-action flex-wrap">
				<button class="btn btn-ghost" onclick={onclose}>Close</button>
				<button
					class="btn btn-secondary"
					onclick={() => (activeTab === 'maps' ? tryDownloadMaps() : tryDownloadLocations())}
					disabled={!!validationError && !allowOverride}
				>
					<MaterialSymbol>download</MaterialSymbol>
					Download {activeTab === 'maps' ? 'maps.json' : 'locations.json'}
				</button>
				<button class="btn btn-primary" onclick={tryDownloadAll}>
					<MaterialSymbol>download</MaterialSymbol>
					Download All
				</button>
				{#if validationError}
					<br />
					<div class="alert flex grow justify-between alert-error">
						{validationError}
						<button class="btn btn-warning" onclick={handleOverride}>Export anyway</button>
					</div>
				{/if}
			</div>
		</div>
		<div
			class="modal-backdrop"
			role="button"
			tabindex="0"
			onclick={onclose}
			onkeydown={(e) => e.key === 'Escape' && onclose()}
		></div>
	</div>
{/if}
