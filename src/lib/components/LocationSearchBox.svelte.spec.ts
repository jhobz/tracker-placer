import { appState } from '$lib/state.svelte'
import type { Location } from '$lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import LocationSearchBox from './LocationSearchBox.svelte'

function makeLocation(partial: Partial<Location> = {}): Location {
	return { name: '', children: [], map_locations: [], sections: [], ...partial }
}

describe('LocationSearchBox', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null

		appState.addPack()
		const pack = appState.selectedPack!
		pack.locations = [
			makeLocation({ name: 'Eastern Palace' }),
			makeLocation({ name: 'Desert Palace' }),
			makeLocation({ name: 'Tower of Hera' })
		]
	})

	it('renders search input', async () => {
		const { getByPlaceholder } = render(LocationSearchBox, { onSelect: vi.fn() })

		await expect.element(getByPlaceholder('Search existing locations...')).toBeVisible()
	})

	it('shows results matching query', async () => {
		const { getByPlaceholder, getByText } = render(LocationSearchBox, { onSelect: vi.fn() })
		await getByPlaceholder('Search existing locations...').fill('palace')

		await expect.element(getByText('Eastern Palace')).toBeVisible()
		await expect.element(getByText('Desert Palace')).toBeVisible()
	})

	it('calls onSelect when a result is clicked', async () => {
		const onSelect = vi.fn()

		const { getByPlaceholder, getByText } = render(LocationSearchBox, { onSelect })
		await getByPlaceholder('Search existing locations...').fill('tower')
		await getByText('Tower of Hera').click()

		expect(onSelect).toHaveBeenCalledExactlyOnceWith(appState.selectedPack!.locations[2])
	})

	it('shows nothing if no results', async () => {
		const { getByPlaceholder, getByRole } = render(LocationSearchBox, { onSelect: vi.fn() })
		await getByPlaceholder('Search existing locations...').fill('zzz')

		expect(getByRole('menu')).not.toBeInTheDocument()
	})
})
