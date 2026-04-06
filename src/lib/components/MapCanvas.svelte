<script lang="ts">
	import { appState } from '$lib/state.svelte'

	let containerEl: HTMLDivElement | undefined = $state()
	let imageEl: HTMLImageElement | undefined = $state()

	// Natural image dimensions
	let naturalWidth = $state(0)
	let naturalHeight = $state(0)

	// Rendered image rect within container
	let renderedRect = $state({ left: 0, top: 0, width: 0, height: 0 })

	const map = $derived(appState.selectedMap)
	const imageUrl = $derived(appState.getImageUrlForMap(map?.id ?? ''))

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
		if (!appState.placingMode || !map || !containerEl) {
			return
		}
		const cr = containerEl.getBoundingClientRect()
		const rx = e.clientX - cr.left
		const ry = e.clientY - cr.top
		const { x, y } = renderedToImage(rx, ry)
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

		const ro = new ResizeObserver(() => updateRenderedRect())
		ro.observe(containerEl)

		return () => ro.disconnect()
	})
</script>

<div
	bind:this={containerEl}
	class={{
		'relative h-full w-full p-4': true,
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
		{#if map && naturalWidth > 0}
			<svg
				class="pointer-events-none absolute inset-0 h-full w-full"
				viewBox="0 0 {renderedRect.width} {renderedRect.height}"
				style="left: {renderedRect.left}px; top: {renderedRect.top}px; width: {renderedRect.width}px; height: {renderedRect.height}px;"
			>
				{#each map.locationBoxes as box (box.id)}
					{@const pos = imageToRendered(box.x, box.y)}
					{@const { w, h } = getBoxDisplaySize(box)}
					{@const rw = (w / naturalWidth) * renderedRect.width}
					{@const rh = (h / naturalHeight) * renderedRect.height}
					<rect
						x={pos.x - rw / 2}
						y={pos.y - rh / 2}
						width={rw}
						height={rh}
						fill={appState.selectedBoxId === box.id
							? 'rgba(var(--color-primary-rgb, 99, 102, 241), 0.3)'
							: 'rgba(255, 165, 0, 0.25)'}
						stroke={appState.selectedBoxId === box.id ? 'oklch(var(--p))' : '#f97316'}
						stroke-width={map.locationBorderThickness}
						rx="2"
						class="pointer-events-none"
					/>
				{/each}
			</svg>

			<!-- Clickable hitboxes for boxes (pointer-events enabled) -->
			{#each map.locationBoxes as box (box.id)}
				{@const pos = imageToRendered(box.x, box.y)}
				{@const { w, h } = getBoxDisplaySize(box)}
				{@const rw = (w / naturalWidth) * renderedRect.width}
				{@const rh = (h / naturalHeight) * renderedRect.height}
				<button
					class="absolute -translate-x-1/2 -translate-y-1/2 rounded focus:outline-none"
					style="left: {renderedRect.left + pos.x}px; top: {renderedRect.top +
						pos.y}px; width: {rw}px; height: {rh}px;"
					title={box.locations.map((l) => l.name).join(', ')}
					onclick={(e) => {
						e.stopPropagation()
						if (!appState.placingMode) {
							appState.selectBox(box.id)
						}
					}}
				></button>
			{/each}
		{/if}
	{:else}
		<div class="flex h-full flex-col items-center justify-center gap-4">
			<svg
				class="h-20 w-20 text-base-content/20"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1"
					d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 15V5m0 0L9 7"
				/>
			</svg>
			<p class="text-center text-sm text-base-content/40">
				{#if map}
					No image uploaded for this map.<br />Edit the map properties to add one.
				{:else}
					Select a map from the sidebar<br />or create a new one to get started.
				{/if}
			</p>
		</div>
	{/if}
</div>
