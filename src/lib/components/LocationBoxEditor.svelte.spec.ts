import { appState, createLocation, createMap } from '$lib/state.svelte'
import type { Location } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import LocationBoxEditorWrapper from './LocationBoxEditorWrapper.svelte'
import { LocationsTabContext } from './LocationsTab/LocationsTabContext.svelte'

describe('LocationBoxEditor', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null

		appState.addPack()
		const pack = appState.selectedPack!
		const map = createMap()
		pack.maps.push(map)
		const location = createLocation()
		const box = $state({ map: map.id, x: 150.7, y: 250.3 })
		location.map_locations = [box]
		pack.locations.push(location)
		appState.selectedMapId = map.id
		appState.selectedBox = box
	})

	it('shows Location Box heading when a box is selected', async () => {
		const box = appState.selectedBox!

		const { getByText } = render(LocationBoxEditorWrapper, { box })

		await expect.element(getByText('Location Box')).toBeVisible()
	})

	it('displays rounded X and Y coordinates', async () => {
		const box = appState.selectedBox!

		const { getByText } = render(LocationBoxEditorWrapper, { box })

		await expect.element(getByText('151')).toBeVisible()
		await expect.element(getByText('250')).toBeVisible()
	})

	it('shows shape override inputs', async () => {
		const box = appState.selectedBox!

		const { getByRole } = render(LocationBoxEditorWrapper, { box })

		await expect.element(getByRole('spinbutton', { name: 'Size' })).toBeVisible()
	})

	it('renders the Location section with location details', async () => {
		const box = appState.selectedBox!

		const { getByText } = render(LocationBoxEditorWrapper, { box })

		await expect.element(getByText('Location', { exact: true })).toBeVisible()
		await expect.element(getByText('Name', { exact: true })).toBeVisible()
		await expect.element(getByText('New Location', { exact: true })).toBeVisible()
		await expect.element(getByText('Path', { exact: true })).toBeVisible()
		await expect.element(getByText('/New Location', { exact: true })).toBeVisible()
		await expect.element(getByText('Sections', { exact: true })).toBeVisible()
	})

	it('removes the location box when delete button is clicked', async () => {
		const pack = appState.selectedPack!
		const box = appState.selectedBox!
		expect(pack.locations[0].map_locations).toHaveLength(1)
		expect(pack.locations[0].map_locations).toContain(box)

		const { getByRole } = render(LocationBoxEditorWrapper, { box })

		await getByRole('button', { name: 'Delete location box' }).click()

		expect(pack.locations[0].map_locations).toHaveLength(0)
		expect(pack.locations[0].map_locations).not.toContain(box)
		expect(appState.selectedBox).toBeNull()
	})

	it('navigates away when location edit button is clicked', async () => {
		const box = appState.selectedBox!
		const context = new MockContext()
		expect(appState.currentTab).toBe('box')

		const { getByRole } = render(LocationBoxEditorWrapper, { props: { box, context } })
		await getByRole('button', { name: 'Edit location' }).click()

		expect(appState.currentTab).toBe('locations')
		expect(context.currentLocation).toBe(appState.selectedPack!.locations[0])
		expect(context.called).toBe(true)
	})

	it('turns box ephemeral (clears map location) when clear location button is clicked', async () => {
		const box = appState.selectedBox!
		const pack = appState.selectedPack!
		expect(pack.locations[0].map_locations).toContain(box)

		const { getByRole } = render(LocationBoxEditorWrapper, { box })
		await getByRole('button', { name: 'Clear location' }).click()

		expect(pack.locations[0].map_locations).not.toContain(box)
		expect(appState.selectedBox).toBe(box)
	})

	it('shows search box and add location button when box is not assigned to a location', async () => {
		// beforeEach creates a location with the box as its map_location, so clear that first
		appState.selectedPack!.locations[0].map_locations = []
		const box = appState.selectedBox!

		const { getByRole } = render(LocationBoxEditorWrapper, { box })

		await expect.element(getByRole('combobox', { name: 'Search existing locations' })).toBeVisible()
		await expect.element(getByRole('button', { name: 'Add a new location' })).toBeVisible()
	})

	it('creates and assigns a new location when add location button is clicked', async () => {
		// beforeEach creates a location with the box as its map_location, so clear that first
		appState.selectedPack!.locations[0].map_locations = []
		const box = appState.selectedBox!

		const { getByRole } = render(LocationBoxEditorWrapper, { box })
		await getByRole('button', { name: 'Add a new location' }).click()

		expect(appState.selectedPack!.locations).toHaveLength(2)
		expect(appState.selectedPack!.locations[1].map_locations).toHaveLength(1)
		expect(appState.selectedPack!.locations[1].map_locations).toContain(box)
	})
})

class MockContext extends LocationsTabContext {
	#currentLocation: Location | null = null
	called = false

	get currentLocation() {
		return this.#currentLocation
	}
	set currentLocation(location: Location | null) {
		this.#currentLocation = location
		this.called = true
	}
}
