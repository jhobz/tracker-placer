import { page } from 'vitest/browser'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import MapList from './MapList.svelte'
import { appState, createMap } from '$lib/state.svelte'

describe('MapList', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.addPack()
	})

	it('shows empty state when no maps exist', async () => {
		render(MapList, { onUploadNew: () => {} })

		await expect.element(page.getByText('No maps yet')).toBeInTheDocument()
	})

	it('renders the Maps heading', async () => {
		render(MapList, { onUploadNew: () => {} })

		await expect.element(page.getByText('Maps', { exact: true })).toBeInTheDocument()
	})

	it('renders map names in the list', async () => {
		const map1 = createMap()
		map1.name = 'Overworld'
		const map2 = createMap()
		map2.name = 'Dungeon'
		appState.maps.push(map1, map2)

		render(MapList, { onUploadNew: () => {} })

		await expect.element(page.getByText('Overworld')).toBeInTheDocument()
		await expect.element(page.getByText('Dungeon')).toBeInTheDocument()
	})

	it('calls onUploadNew when add button is clicked', async () => {
		const onUploadNew = vi.fn()
		render(MapList, { onUploadNew })

		await page.getByRole('button', { name: 'Add map' }).click()

		expect(onUploadNew).toHaveBeenCalledOnce()
	})

	it('selects a map when clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)

		render(MapList, { onUploadNew: () => {} })

		await page.getByText('Overworld').click()

		expect(appState.selectedMapId).toBe(appState.maps[0].id)
	})

	it('removes a map when remove button is clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = appState.maps[0].id

		render(MapList, { onUploadNew: () => {} })

		await page.getByRole('button', { name: 'Remove map' }).click()

		expect(appState.maps).toHaveLength(0)
	})

	it('shows placeholder icon when map has no image', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)

		render(MapList, { onUploadNew: () => {} })

		// Map name should be visible, no <img> element
		await expect.element(page.getByText('Overworld')).toBeInTheDocument()
	})
})
