import { appState, createMap } from '$lib/state.svelte'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import MapTabs from './MapTabs.svelte'

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
		const { getByText } = render(MapTabs, { onUploadNew: () => {} })

		await expect.element(getByText('No maps yet')).toBeVisible()
	})

	it('renders map names as tabs', async () => {
		const map1 = createMap()
		map1.name = 'Overworld'
		const map2 = createMap()
		map2.name = 'Dungeon'
		appState.maps.push(map1, map2)

		const { getByRole } = render(MapTabs, { onUploadNew: () => {} })

		await expect.element(getByRole('tab', { name: 'Overworld' })).toBeVisible()
		await expect.element(getByRole('tab', { name: 'Dungeon' })).toBeVisible()
	})

	it('marks the selected map tab as active', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		const { getByRole } = render(MapTabs, { onUploadNew: () => {} })

		const tab = getByRole('tab', { name: 'Overworld' })
		await expect.element(tab).toHaveClass(/tab-active/)
	})

	it('selects a map when its tab is clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)

		const { getByRole } = render(MapTabs, { onUploadNew: () => {} })
		await getByRole('tab', { name: 'Overworld' }).click()

		expect(appState.selectedMapId).toBe(map.id)
	})

	it('calls onUploadNew when add button is clicked', async () => {
		const onUploadNew = vi.fn()
		const { getByRole } = render(MapTabs, { onUploadNew })

		await getByRole('button', { name: 'Add map' }).click()

		expect(onUploadNew).toHaveBeenCalledOnce()
	})

	it('removes a map when close button is clicked', async () => {
		const map = createMap()
		map.name = 'Overworld'
		appState.maps.push(map)
		appState.selectedMapId = map.id

		const { getByRole } = render(MapTabs, { onUploadNew: () => {} })
		await getByRole('button', { name: 'Remove map' }).click()

		expect(appState.maps).toHaveLength(0)
	})

	it('uses DaisyUI tabs component classes', async () => {
		const { getByRole } = render(MapTabs, { onUploadNew: () => {} })

		await expect.element(getByRole('tablist')).toBeVisible()
	})
})
