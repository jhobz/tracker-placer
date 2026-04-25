import { appState } from '$lib/state.svelte'
import type { Location } from '$lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { userEvent } from 'vitest/browser'
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

	it('highlights results with ArrowDown/ArrowUp', async () => {
		const { getByPlaceholder, getByText } = render(LocationSearchBox, { onSelect: vi.fn() })
		const input = getByPlaceholder('Search existing locations...')
		await input.fill('palace')

		// ArrowDown highlights first result
		await userEvent.keyboard('{ArrowDown}')
		const first = getByText('Eastern Palace')

		expect(first.element().classList.contains('menu-active')).toBe(true)

		// ArrowDown highlights second result
		await userEvent.keyboard('{ArrowDown}')
		const second = getByText('Desert Palace')

		expect(second.element().classList.contains('menu-active')).toBe(true)

		// ArrowDown wraps around
		await userEvent.keyboard('{ArrowDown}')

		expect(first.element().classList.contains('menu-active')).toBe(true)

		// ArrowUp wraps around
		await userEvent.keyboard('{ArrowUp}')

		expect(second.element().classList.contains('menu-active')).toBe(true)
	})

	it('selects highlighted result with Enter', async () => {
		const onSelect = vi.fn()

		const { getByPlaceholder } = render(LocationSearchBox, { onSelect })
		const input = getByPlaceholder('Search existing locations...')
		await input.fill('palace')
		// ArrowDown to highlight first result
		await userEvent.keyboard('{ArrowDown}')
		// Enter to select
		await userEvent.keyboard('{Enter}')

		expect(onSelect).toHaveBeenCalledWith(appState.selectedPack!.locations[0])
	})

	it('sets correct ARIA attributes', async () => {
		const { getByPlaceholder } = render(LocationSearchBox, { onSelect: vi.fn() })
		const input = getByPlaceholder('Search existing locations...')
		await input.fill('palace')

		expect(input.element().getAttribute('role')).toBe('combobox')
		expect(input.element().getAttribute('aria-expanded')).toBe('true')
		expect(input.element().getAttribute('aria-autocomplete')).toBe('list')
		expect(input.element().getAttribute('aria-controls')).toBe('location-search-results')

		// ArrowDown to highlight first result
		await userEvent.keyboard('{ArrowDown}')

		expect(input.element().getAttribute('aria-activedescendant')).toBe('location-search-result-0')
	})
})
