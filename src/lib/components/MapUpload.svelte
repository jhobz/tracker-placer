<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'

	let { onupload }: { onupload?: () => void } = $props()

	let dragOver = $state(false)
	let fileInput: HTMLInputElement | undefined = $state()

	async function handleFileSelect(files: FileList | null) {
		if (!files || files.length === 0) {
			return
		}

		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				continue
			}

			appState.addMap()
			const map = appState.selectedMap!
			map.name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
			const buffer = await file.arrayBuffer()
			map.imageFile = new Blob([buffer], { type: file.type })
			map.imageUrl = '/images/' + file.name
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
</script>

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
	<MaterialSymbol size="4xl">image_arrow_up</MaterialSymbol>
	<p class="mb-1 text-sm font-medium">Drop map images here or click to upload</p>
	<p class="text-xs text-base-content/40">PNG, JPG, GIF, WebP supported · Multiple files OK</p>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
	/>
</div>
