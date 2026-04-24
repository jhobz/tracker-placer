<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import type { Location, MapConfig } from '$lib/types'
	import {
		extractLocationsFromPackFile,
		extractMapsFromPackFile,
		extractPackNameFromPackFile
	} from '$lib/utils/import'
	import MaterialSymbol from './MaterialSymbol.svelte'

	type Props = { open: boolean; onclose: () => void; onupload?: () => void }
	let { open, onclose, onupload }: Props = $props()

	let dragOver = $state(false)
	let fileInput: HTMLInputElement | undefined = $state()
	let extractedPackName = $state('')
	let extractedMaps = $state<MapConfig[]>([])
	let extractedLocations = $state<Location[]>([])

	async function handleFileSelect(files: FileList | null) {
		if (!files || files.length === 0) {
			return
		}

		if (files.length > 1) {
			alert('Please import only one pack at a time.')
			return
		}

		for (const file of files) {
			if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
				continue
			}

			extractedPackName = await extractPackNameFromPackFile(file)
			extractedMaps = await extractMapsFromPackFile(file)
			extractedLocations = await extractLocationsFromPackFile(file)
		}

		onupload?.()
	}

	function onDrop(e: DragEvent) {
		e.preventDefault()
		dragOver = false
		handleFileSelect(e.dataTransfer?.files ?? null)
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault()
		dragOver = true
	}

	function onDragLeave() {
		dragOver = false
	}

	function confirmImport() {
		appState.addPack()
		appState.selectedPack!.name = extractedPackName || 'Imported Pack'
		appState.packs.at(-1)!.maps = extractedMaps
		appState.packs.at(-1)!.locations = extractedLocations
		appState.selectMap(extractedMaps[0]?.id ?? null)

		onExit()
	}

	function onExit() {
		onclose()
		extractedMaps = []
		extractedLocations = []
		extractedPackName = ''
	}
</script>

{#if open}
	<!-- Modal backdrop -->
	<dialog class="modal" aria-modal="true" aria-label="Import Poptracker Pack" {open}>
		<div class="modal-box max-w-3xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold">Import Poptracker Pack</h3>
				<button class="btn btn-circle btn-ghost btn-sm" aria-label="Close" onclick={onExit}>
					<MaterialSymbol>close</MaterialSymbol>
				</button>
			</div>

			<p class="mb-4 text-sm text-base-content/60">
				Import maps and locations from an existing Poptracker pack.
			</p>

			{#if extractedMaps.length > 0 || extractedLocations.length > 0}
				<div class="mb-4 max-h-48 overflow-y-auto rounded border border-base-300 bg-base-100 p-4">
					{#if extractedMaps.length > 0}
						<p class="mb-2 font-medium">Maps:</p>
						<pre>{JSON.stringify(extractedMaps, null, 2)}</pre>
					{/if}

					{#if extractedLocations.length > 0}
						<p class="mb-2 font-medium">Locations:</p>
						<ul class="list-disc pl-6">
							{#each extractedLocations as location}
								<li>{location.name}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{:else}
				<div
					class={{
						'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-300 bg-base-200 p-8 text-base-content/70 transition-colors': true,
						'border-primary bg-primary/10': dragOver
					}}
					role="button"
					tabindex="0"
					ondrop={onDrop}
					ondragover={onDragOver}
					ondragleave={onDragLeave}
					onclick={() => fileInput?.click()}
					onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
				>
					<MaterialSymbol size="4xl">drive_folder_upload</MaterialSymbol>
					<p class="mb-1 text-sm font-medium">Drop Poptracker pack here or click to upload</p>
					<p class="text-xs text-base-content/40">Only ZIP supported · Single file only</p>
					<input
						bind:this={fileInput}
						type="file"
						accept="application/zip,application/x-zip-compressed"
						class="hidden"
						aria-label="Upload Poptracker pack ZIP file"
						onchange={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
					/>
				</div>
			{/if}

			<div class="modal-action flex-wrap">
				<button class="btn btn-ghost" onclick={onExit}>Close</button>
				<button
					class="btn btn-primary"
					disabled={extractedMaps.length === 0 && extractedLocations.length === 0}
					onclick={confirmImport}>Import pack</button
				>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={onExit} onkeydown={(e) => e.key === 'Escape' && onExit()}>close</button>
		</form>
	</dialog>
{/if}
