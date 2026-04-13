import { appState, createLocationBox, createMap } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'

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
		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('Click a location box on the map')).toBeVisible()
	})

	it('shows Location Box heading when a box is selected', async () => {
		const map = createMap()
		const box = createLocationBox(150, 250)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('Location Box')).toBeVisible()
	})

	it('displays rounded X and Y coordinates', async () => {
		const map = createMap()
		const box = createLocationBox(150.7, 250.3)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('151')).toBeVisible()
		await expect.element(getByText('250')).toBeVisible()
	})

	it('shows size override input', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		const { getByRole } = render(LocationBoxEditor)

		await expect.element(getByRole('spinbutton', { name: 'Size' })).toBeVisible()
	})

	it('renders the Locations section via LocationEditor', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		const { getByText } = render(LocationBoxEditor)

		// LocationEditor renders "Locations" heading
		await expect.element(getByText('Locations')).toBeVisible()
	})

	it('removes the location box when delete button is clicked', async () => {
		const map = createMap()
		const box = createLocationBox(100, 200)
		map.locationBoxes.push(box)
		appState.maps.push(map)
		appState.selectedMapId = map.id
		appState.selectedBoxId = box.id

		const { getByRole } = render(LocationBoxEditor)

		await getByRole('button', { name: 'Delete location box' }).click()

		expect(appState.maps[0].locationBoxes).toHaveLength(0)
		expect(appState.selectedBoxId).toBeNull()
	})
})
