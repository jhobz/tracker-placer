import { appState, createMap, createPack } from '$lib/state.svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Header from './Header.svelte'

describe('Header', () => {
	it('renders title and subtitle', async () => {
		const { getByText } = render(Header, { showExportModal: false })

		await expect.element(getByText('Tracker Placer')).toBeVisible()
		await expect.element(getByText('Poptracker Pack Map Builder')).toBeVisible()
	})

	it('shows export button', async () => {
		const { getByText } = render(Header, { showExportModal: false })

		await expect.element(getByText('Export JSON')).toBeVisible()
	})

	it('shows place mode button if map image exists', async () => {
		const pack = createPack()
		appState.packs.push(pack)
		appState.selectedPackId = pack.id
		const map = createMap()
		map.imageFile = createTestBlob()
		pack.maps.push(map)
		appState.selectedMapId = map.id

		const { getByText } = render(Header, { showExportModal: false })

		await expect.element(getByText('Place Box')).toBeVisible()
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
