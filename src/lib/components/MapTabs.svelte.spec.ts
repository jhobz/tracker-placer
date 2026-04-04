import { page } from 'vitest/browser'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import MapTabs from './MapTabs.svelte'
import { appState, createMap } from '$lib/state.svelte'

describe('MapTabs', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.addPack()
	})

	it('shows empty state when no maps exist', async () => {
		render(MapTabs, { onUploadNew: () => {} })

		await expect.element(page.getByText('No maps yet')).toBeInTheDocument()
	})

	it('renders map names as tabs', async () => {
		const map1 = createMap()
		map1.name = 'Overworld'
		const map2 = createMap()
		map2.name = 'Dungeon'
		appState.maps.push(map1, map2)

		render(MapTabs, { onUploadNew: () => {} })

		await expect.element(page.getByRole('tab', { name: 'Overworld' })).toBeInTheDocument()
		await expect.element(page.getByRole('tab', { name: 'Dungeon' })).toBeInTheDocument()
	})

	it('marks the selected map tab as active', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapTabs, { onUploadNew: () => {} })

		const tab = page.getByRole('tab', { name: 'Overworld' })
		await expect.element(tab).toHaveClass(/tab-active/)
	})

	it('selects a map when its tab is clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)

		render(MapTabs, { onUploadNew: () => {} })

		await page.getByRole('tab', { name: 'Overworld' }).click()

		expect(appState.selectedMapId).toBe(map.id)
	})

	it('calls onUploadNew when add button is clicked', async () => {
		const onUploadNew = vi.fn()
		render(MapTabs, { onUploadNew })

		await page.getByRole('button', { name: 'Add map' }).click()

		expect(onUploadNew).toHaveBeenCalledOnce()
	})

	it('removes a map when close button is clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		render(MapTabs, { onUploadNew: () => {} })

		await page.getByRole('button', { name: 'Remove map' }).click()

		expect(appState.maps).toHaveLength(0)
	})

	it('uses DaisyUI tabs component classes', async () => {
		render(MapTabs, { onUploadNew: () => {} })

		await expect.element(page.getByRole('tablist')).toBeInTheDocument()
	})
})
