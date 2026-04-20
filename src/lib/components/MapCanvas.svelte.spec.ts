import { appState, createMap } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { userEvent } from 'vitest/browser'
import MapCanvas from './MapCanvas.svelte'

describe('MapCanvas', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null
		appState.placingMode = false
		appState.addPack()
	})

	it('shows prompt to select a map when none is selected', async () => {
		const { getByText } = render(MapCanvas)

		await expect.element(getByText(/Select a map from the top bar/)).toBeVisible()
	})

	it('shows prompt to upload image when map has no image', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		const { getByText } = render(MapCanvas)

		await expect.element(getByText(/No image found for this map/)).toBeVisible()
	})

	it('renders the map image when imageFile is set', async () => {
		const map = createMap()
		map.name = 'Overworld'
		// Use a tiny valid data URI so the image actually loads
		map.imageFile = createTestBlob()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		const { getByRole } = render(MapCanvas)

		await expect.element(getByRole('img', { name: 'Overworld' })).toBeVisible()
	})

	it('shows placing mode aria-label when placingMode is true', async () => {
		const map = createMap()
		map.imageFile = createTestBlob()
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.placingMode = true

		const { getByRole } = render(MapCanvas)

		await expect.element(getByRole('button', { name: 'Click to place location box' })).toBeVisible()
	})

	it('renders focusable svgs for location boxes', async () => {
		const pack = appState.selectedPack!
		const map = createMap()
		pack.maps.push(map)
		map.imageFile = createTestBlob()
		appState.selectedMapId = map.id
		appState.addLocationBox(50, 50)
		pack.locations[0].name = 'Test Spot'

		const { getByText, container } = render(MapCanvas)

		// The rect has an accompanying title element with the location name(s)
		await expect.element(getByText('Test Spot')).toBeInTheDocument()
		await expect.element(container.querySelector('rect')).toBeVisible()
	})

	describe('Ctrl enters Place Mode', () => {
		beforeEach(() => {
			const map = createMap()
			map.imageFile = createTestBlob()
			appState.maps.push(map)
			appState.selectedMapId = map.id
		})

		it('should enter place mode when Ctrl is held and exit when released', async () => {
			render(MapCanvas)
			expect(appState.placingMode).toBe(false)

			// Simulate holding Ctrl
			await userEvent.keyboard('{Control>}')
			expect(appState.placingMode).toBe(true)

			// Simulate releasing Ctrl
			await userEvent.keyboard('{/Control}')
			expect(appState.placingMode).toBe(false)
		})

		it('should place a box on Ctrl+Click even if not in place mode', async () => {
			const { getByRole } = render(MapCanvas)
			const canvas = getByRole('button', { name: 'Click to place location box' })
			const prevCount = appState.selectedPack?.locations.length ?? -1
			expect(appState.placingMode).toBe(false)

			// Simulate Ctrl+Click
			await canvas.click({ modifiers: ['Control'], position: { x: 10, y: 10 } })

			expect(appState.selectedPack?.locations.length).toBe(prevCount + 1)
		})

		it('should exit place mode if already in place mode Ctrl is pressed & released', async () => {
			render(MapCanvas)
			appState.placingMode = true

			// Simulate holding Ctrl
			await userEvent.keyboard('{Control>}')
			expect(appState.placingMode).toBe(true)

			// Simulate releasing Ctrl
			await userEvent.keyboard('{/Control}')
			expect(appState.placingMode).toBe(false)
		})
	})
})

function createTestBlob(): Blob | null {
	return new Blob([
		Uint8Array.from(
			atob(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
			),
			(c) => c.charCodeAt(0)
		)
	])
}
