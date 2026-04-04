<script lang="ts">
	import { appState } from '$lib/state.svelte.js'

	let dragOver = $state(false)
	let fileInput: HTMLInputElement | undefined = $state()

	function handleFileSelect(files: FileList | null) {
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
			const reader = new FileReader()
			reader.onload = (e) => {
				map.imageUrl = e.target?.result as string
			}
			reader.onerror = () => {
				console.error('tracker-placer: failed to read image file', file.name)
			}
			reader.readAsDataURL(file)
		}
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
	class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-300 bg-base-200 p-8 transition-colors {dragOver
		? 'border-primary bg-primary/10'
		: ''}"
	role="button"
	tabindex="0"
	ondrop={onDrop}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	onclick={() => fileInput?.click()}
	onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
>
	<svg
		class="mb-3 h-12 w-12 text-base-content/40"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
		/>
	</svg>
	<p class="mb-1 text-sm font-medium text-base-content/70">
		Drop map images here or click to upload
	</p>
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
