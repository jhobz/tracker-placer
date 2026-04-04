import { page } from 'vitest/browser'
import { describe, expect, it, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import MapProperties from './MapProperties.svelte'
import { appState, createMap, createLocationBox } from '$lib/state.svelte'

describe('MapProperties', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.addPack()
	})

	it('renders nothing when no map is selected', async () => {
		render(MapProperties)

		await expect.element(page.getByText('Map Properties')).not.toBeInTheDocument()
	})

	it('renders Map Properties heading when a map is selected', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('Map Properties')).toBeInTheDocument()
	})

	it('shows the map name input with current value', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByPlaceholder('e.g. Overworld')).toHaveValue('Overworld')
	})

	it('shows Choose Image button when no image is set', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('Choose Image')).toBeInTheDocument()
	})

	it('shows Default Location Size label and range', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('Default Location Size')).toBeInTheDocument()
		await expect.element(page.getByText('16px')).toBeInTheDocument()
	})

	it('shows Location Border Thickness label and range', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('Location Border Thickness')).toBeInTheDocument()
		await expect.element(page.getByText('1px')).toBeInTheDocument()
	})

	it('shows location box count', async () => {
		const map = createMap()
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('0 location boxes placed')).toBeInTheDocument()
	})

	it('shows singular "box" when exactly 1 box exists', async () => {
		const map = createMap()
		map.locationBoxes.push(createLocationBox(0, 0))
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByText('1 location box placed')).toBeInTheDocument()
	})

	it('shows map image when imageUrl is set', async () => {
		const map = createMap()
		map.imageUrl = 'blob:http://localhost/fake'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapProperties)

		await expect.element(page.getByRole('img', { name: map.name })).toBeInTheDocument()
	})
})
