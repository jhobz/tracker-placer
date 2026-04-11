import { appState, createLocationBox, createMap } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'

import LocationBoxEditor from './LocationBoxEditor.svelte'

describe('LocationBoxEditor', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.addPack()
	})

	it('shows empty state when no box is selected', async () => {
		render(LocationBoxEditor)

		await expect.element(page.getByText(/Click a location box on the map/)).toBeInTheDocument()
	})

	it('shows Location Box heading when a box is selected', async () => {
		const map = createMap()
		const box = createLocationBox(150, 250)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		render(LocationBoxEditor)

		await expect.element(page.getByText('Location Box')).toBeInTheDocument()
	})

	it('displays rounded X and Y coordinates', async () => {
		const map = createMap()
		const box = createLocationBox(150.7, 250.3)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		render(LocationBoxEditor)

		await expect.element(page.getByText('151')).toBeInTheDocument()
		await expect.element(page.getByText('250')).toBeInTheDocument()
	})

	it('shows size override inputs', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		render(LocationBoxEditor)

		await expect.element(page.getByText('Size Override')).toBeInTheDocument()
		await expect.element(page.getByText('Rect Width')).toBeInTheDocument()
		await expect.element(page.getByText('Rect Height')).toBeInTheDocument()
	})

	it('renders the Locations section via LocationEditor', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		render(LocationBoxEditor)

		// LocationEditor renders "Locations" heading
		await expect.element(page.getByText('Locations')).toBeInTheDocument()
	})

	it('removes the location box when delete button is clicked', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		render(LocationBoxEditor)

		await page.getByTitle('Delete this location box').click()

		expect(appState.maps[0].locationBoxes).toHaveLength(0)
		expect(appState.selectedBoxId).toBeNull()
	})
})
