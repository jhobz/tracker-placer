import { page } from 'vitest/browser'
import { describe, expect, it, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import MapCanvas from './MapCanvas.svelte'
import { appState, createMap, createLocationBox } from '$lib/state.svelte'

describe('MapCanvas', () => {
	beforeEach(() => {
		cleanup()
		appState.maps.length = 0
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.placingMode = false
	})

	it('shows prompt to select a map when none is selected', async () => {
		render(MapCanvas)

		await expect.element(page.getByText(/Select a map from the sidebar/)).toBeInTheDocument()
	})

	it('shows prompt to upload image when map has no image', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapCanvas)

		await expect.element(page.getByText(/No image uploaded for this map/)).toBeInTheDocument()
	})

	it('renders the map image when imageUrl is set', async () => {
		const map = createMap()
		map.name = 'Overworld'
		// Use a tiny valid data URI so the image actually loads
		map.imageUrl =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapCanvas)

		await expect.element(page.getByRole('img', { name: 'Overworld' })).toBeInTheDocument()
	})

	it('shows placing mode aria-label when placingMode is true', async () => {
		const map = createMap()
		map.imageUrl =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.placingMode = true

		render(MapCanvas)

		await expect
			.element(page.getByRole('button', { name: 'Click to place location box' }))
			.toBeInTheDocument()
	})

	it('renders clickable hitboxes for location boxes', async () => {
		const map = createMap()
		map.imageUrl =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
		const box = createLocationBox(50, 50)
		box.locations[0].name = 'Test Spot'
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapCanvas)

		// The hitbox button has a title with the location name
		await expect.element(page.getByRole('button', { name: 'Test Spot' })).toBeInTheDocument()
	})
})
