import { appState, createLocation, createMap } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'

import LocationBoxEditor from './LocationBoxEditor.svelte'

describe('LocationBoxEditor', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null
		appState.addPack()
	})

	it('shows empty state when no box is selected', async () => {
		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('Click a location box on the map')).toBeVisible()
	})

	it('shows Location Box heading when a box is selected', async () => {
		appState.addPack()
		const pack = appState.selectedPack!
		const map = createMap()
		pack.maps.push(map)
		const location = createLocation()
		const box = { map: map.id, x: 150, y: 250 }
		location.map_locations = [box]
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box

		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('Location Box')).toBeVisible()
	})

	it('displays rounded X and Y coordinates', async () => {
		appState.addPack()
		const map = createMap()
		const box = { map: map.id, x: 150.7, y: 250.3 }
		const location = createLocation()
		location.map_locations = [box]
		const pack = appState.selectedPack!
		pack.maps.push(map)
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box

		const { getByText } = render(LocationBoxEditor)

		await expect.element(getByText('151')).toBeVisible()
		await expect.element(getByText('250')).toBeVisible()
	})

	it('shows shape override inputs', async () => {
		appState.addPack()
		const map = createMap()
		const box = { map: map.id, x: 100, y: 200 }
		const location = createLocation()
		location.map_locations = [box]
		const pack = appState.selectedPack!
		pack.maps.push(map)
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box

		const { getByRole } = render(LocationBoxEditor)

		await expect.element(getByRole('spinbutton', { name: 'Size' })).toBeVisible()
	})

	it('renders the Locations section via LocationEditor', async () => {
		appState.addPack()
		const map = createMap()
		const box = { map: map.id, x: 100, y: 200 }
		const location = createLocation()
		location.map_locations = [box]
		const pack = appState.selectedPack!
		pack.maps.push(map)
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box

		const { getByText } = render(LocationBoxEditor)

		// LocationEditor renders "Locations" heading
		await expect.element(getByText('Locations')).toBeVisible()
	})

	it('removes the location box when delete button is clicked', async () => {
		const map = createMap()
		const box = { map: map.id, x: 100, y: 200 }
		const location = createLocation()
		location.map_locations = [box]
		const pack = appState.selectedPack!
		pack.maps.push(map)
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box

		const { getByRole } = render(LocationBoxEditor)

		await getByRole('button', { name: 'Delete location box' }).click()

		expect(pack.locations[0].map_locations).toHaveLength(0)
		expect(appState.selectedBox).toBeNull()
	})
})
