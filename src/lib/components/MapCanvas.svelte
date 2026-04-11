<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'

	let containerEl: HTMLDivElement | undefined = $state()
	let imageEl: HTMLImageElement | undefined = $state()

	// Natural image dimensions
	let naturalWidth = $state(0)
	let naturalHeight = $state(0)

	// Rendered image rect within container
	let renderedRect = $state({ left: 0, top: 0, width: 0, height: 0 })

	const map = $derived(appState.selectedMap)
	let imageUrl = $state('')
	$effect(() => {
		if (!map || !map.imageFile) {
			imageUrl = ''
			return
		}

		imageUrl = URL.createObjectURL(map.imageFile)

		return () => {
			URL.revokeObjectURL(imageUrl)
		}
	})
	// const imageUrl = $derived(appState.getImageUrlForMap(map?.id ?? ''))

	function updateRenderedRect() {
		if (!imageEl || !containerEl) {
			return
		}

		const r = imageEl.getBoundingClientRect()
		const cr = containerEl.getBoundingClientRect()

		renderedRect = {
			left: r.left - cr.left,
			top: r.top - cr.top,
			width: r.width,
			height: r.height
		}
	}

	function imageToRendered(ix: number, iy: number) {
		if (!naturalWidth || !naturalHeight) {
			return { x: 0, y: 0 }
		}

		return {
			x: renderedRect.left + (ix / naturalWidth) * renderedRect.width,
			y: renderedRect.top + (iy / naturalHeight) * renderedRect.height
		}
	}

	function renderedToImage(rx: number, ry: number) {
		if (!renderedRect.width || !renderedRect.height) {
			return { x: 0, y: 0 }
		}

		return {
			x: ((rx - renderedRect.left) / renderedRect.width) * naturalWidth,
			y: ((ry - renderedRect.top) / renderedRect.height) * naturalHeight
		}
	}

	function getBoxDisplaySize(box: { size: number; rectWidth: number; rectHeight: number }) {
		const size = box.size > 0 ? box.size : (map?.locationSize ?? 16)
		const w = box.rectWidth > 0 ? box.rectWidth : size
		const h = box.rectHeight > 0 ? box.rectHeight : size
		return { w, h }
	}

	function handleCanvasClick(e: MouseEvent) {
		if (!map || !containerEl) {
			return
		}

		if (e.target instanceof Element && e.target.tagName !== 'rect' && !appState.placingMode) {
			appState.selectedBoxId = null
			return
		}

		if (e.target instanceof Element && e.target.tagName === 'rect') {
			// Let the click event on boxes be handled by their own handlers
			return
		}

		const canvasRect = containerEl.getBoundingClientRect()
		const canvasX = e.clientX - canvasRect.left
		const canvasY = e.clientY - canvasRect.top
		const { x, y } = renderedToImage(canvasX, canvasY)
		appState.addLocationBox(x, y)
	}

	function onImageLoad(e: Event) {
		const img = e.target as HTMLImageElement
		naturalWidth = img.naturalWidth
		naturalHeight = img.naturalHeight
		// Use requestAnimationFrame to ensure layout is done
		requestAnimationFrame(updateRenderedRect)
	}

	// Update rect on resize
	$effect(() => {
		if (!containerEl) {
			return
		}

		const ro = new ResizeObserver(() => requestAnimationFrame(updateRenderedRect))
		ro.observe(containerEl)

		return () => ro.disconnect()
	})
</script>

<div
	bind:this={containerEl}
	class={{
		'relative h-full w-full': true,
		'cursor-crosshair': appState.placingMode
	}}
	onclick={handleCanvasClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleCanvasClick(e as unknown as MouseEvent)
		}
	}}
	role={appState.placingMode ? 'button' : undefined}
	aria-label={appState.placingMode ? 'Click to place location box' : undefined}
>
	{#if map && imageUrl}
		<img
			bind:this={imageEl}
			src={imageUrl}
			alt={map.name}
			class="mx-auto max-h-full max-w-full select-none"
			draggable="false"
			onload={onImageLoad}
		/>

		<!-- Location boxes overlay -->
		{#if naturalWidth > 0}
			<svg
				class="absolute"
				viewBox="0 0 {naturalWidth} {naturalHeight}"
				style:left="{renderedRect.left}px"
				style:top="{renderedRect.top}px"
				style:width="{renderedRect.width}px"
				style:height="{renderedRect.height}px"
			>
				{#each map.locationBoxes as box (box.id)}
					{@const { w, h } = getBoxDisplaySize(box)}
					<g>
						<title>{box.locations.map((l) => l.name).join('\n')}</title>
						<rect
							x={box.x - w / 2}
							y={box.y - h / 2}
							width={w}
							height={h}
							fill="oklch(from var(--color-primary) l c h / {appState.selectedBoxId === box.id
								? 0.75
								: 0.3})"
							stroke={appState.selectedBoxId === box.id ? 'white' : 'var(--color-primary)'}
							stroke-width={map.locationBorderThickness}
							rx="2"
							class="focus:outline-none"
							role="button"
							onfocus={(e) => {
								e.stopPropagation()
								if (!appState.placingMode) {
									appState.selectBox(box.id)
								}
							}}
						/>
					</g>
				{/each}
			</svg>
		{/if}
	{:else}
		<div class="h-full content-center justify-items-center text-center text-base-content/40">
			<MaterialSymbol size="4xl">map_search</MaterialSymbol>
			<p class="mt-4">
				{#if map}
					No image found for this map.<br />Edit the map properties to add one.
				{:else}
					Select a map from the top bar<br />or create a new one to get started.
				{/if}
			</p>
		</div>
	{/if}
</div>
