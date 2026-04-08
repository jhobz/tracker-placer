import type { PoptrackerLocation, PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import LocationEditor from './LocationEditor.svelte'

function makeSection(overrides: Partial<PoptrackerSection> = {}): PoptrackerSection {
	return {
		id: 'sec-1',
		name: 'Test Section',
		item_count: 1,
		hosted_item: '',
		access_rules: [],
		visibility_rules: [],
		chest_unopened_img: '',
		chest_opened_img: '',
		...overrides
	}
}

function makeLocation(overrides: Partial<PoptrackerLocation> = {}): PoptrackerLocation {
	return {
		id: 'loc-1',
		name: 'Test Location',
		chest_unopened_img: '',
		chest_opened_img: '',
		inherit_icon_from: '',
		access_rules: [],
		visibility_rules: [],
		sections: [makeSection()],
		children: [],
		map_locations: [],
		...overrides
	}
}

describe('LocationEditor', () => {
	beforeEach(() => {
		cleanup()
	})

	it('renders empty state when no locations', async () => {
		render(LocationEditor, { locations: [] })

		await expect.element(page.getByText('No locations. Add one above.')).toBeInTheDocument()
	})

	it('renders a location with its name', async () => {
		const locations = $state([makeLocation({ name: 'Eastern Palace' })])
		render(LocationEditor, { locations })

		await expect.element(page.getByText('Eastern Palace')).toBeInTheDocument()
	})

	it('shows Unnamed for location with empty name', async () => {
		const locations = $state([makeLocation({ name: '' })])
		render(LocationEditor, { locations })

		await expect.element(page.getByText('Unnamed')).toBeInTheDocument()
	})

	it('auto-expands the first location', async () => {
		const locations = $state([makeLocation({ name: 'My Location' })])
		render(LocationEditor, { locations })

		// Expanded content should show the Location Name input
		await expect.element(page.getByPlaceholder('e.g. Eastern Palace')).toBeInTheDocument()
	})

	it('shows location name input with correct value when expanded', async () => {
		const locations = $state([makeLocation({ name: 'Kakariko Village' })])
		render(LocationEditor, { locations })

		await expect
			.element(page.getByPlaceholder('e.g. Eastern Palace'))
			.toHaveValue('Kakariko Village')
	})

	it('shows icon fields when expanded', async () => {
		const locations = $state([makeLocation()])
		render(LocationEditor, { locations })

		// Inherit Icon From only appears in LocationEditor (not SectionEditor)
		await expect.element(page.getByText('Inherit Icon From')).toBeInTheDocument()
		await expect.element(page.getByPlaceholder('parent_location_name')).toBeInTheDocument()
	})

	it('shows access rules and visibility rules fields', async () => {
		const locations = $state([makeLocation({ sections: [] })])
		render(LocationEditor, { locations })

		// With no sections, these labels are unambiguously from LocationEditor
		await expect.element(page.getByText('Access Rules')).toBeInTheDocument()
		await expect.element(page.getByText('Visibility Rules')).toBeInTheDocument()
	})

	it('shows Sections divider when expanded', async () => {
		const locations = $state([makeLocation({ sections: [] })])
		render(LocationEditor, { locations })

		// The divider text "Sections" and nested SectionEditor both render
		await expect.element(page.getByText('No sections. Add one above.')).toBeInTheDocument()
	})

	it('adds a new location when Add button is clicked', async () => {
		const locations = $state([makeLocation({ sections: [] })])
		render(LocationEditor, { locations })

		// Only one "Add" button when sections are empty (the LocationEditor one)
		// Actually, SectionEditor also shows an "Add" button. Use the first one.
		const addButtons = page.getByRole('button', { name: 'Add' })
		await addButtons.first().click()

		expect(locations).toHaveLength(2)
	})

	it('removes a location when remove button is clicked', async () => {
		const locations = $state([makeLocation()])
		render(LocationEditor, { locations })

		await page.getByRole('button', { name: 'Remove location' }).click()

		expect(locations).toHaveLength(0)
	})

	it('renders multiple locations', async () => {
		const locations = $state([
			makeLocation({ id: 'loc-1', name: 'Location A' }),
			makeLocation({ id: 'loc-2', name: 'Location B' })
		])
		render(LocationEditor, { locations })

		await expect.element(page.getByText('Location A')).toBeInTheDocument()
		await expect.element(page.getByText('Location B')).toBeInTheDocument()
	})

	it('switches expanded location when another header is clicked', async () => {
		const locations = $state([
			makeLocation({ id: 'loc-1', name: 'Location A', sections: [] }),
			makeLocation({ id: 'loc-2', name: 'Location B', sections: [] })
		])
		render(LocationEditor, { locations })

		// First location should be auto-expanded
		await expect.element(page.getByPlaceholder('e.g. Eastern Palace')).toBeInTheDocument()

		// Click second location to expand it (collapses the first)
		await page.getByText('Location B').click()

		// The input should still exist (now for Location B)
		await expect.element(page.getByPlaceholder('e.g. Eastern Palace')).toHaveValue('Location B')
	})
})
