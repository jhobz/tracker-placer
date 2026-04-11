import type { PoptrackerLocation, PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import LocationEditor from './LocationEditor.svelte'

describe('LocationEditor', () => {
	beforeEach(() => {
		cleanup()
	})

	it('renders empty state when no locations', async () => {
		const { getByText } = render(LocationEditor, { locations: [] })

		await expect.element(getByText('No locations. Add one above.')).toBeVisible()
	})

	it('renders a location with its name', async () => {
		const locations = $state([makeLocation({ name: 'Eastern Palace' })])

		const { getByText } = render(LocationEditor, { locations })

		await expect.element(getByText('Eastern Palace')).toBeVisible()
	})

	it('shows Unnamed for location with empty name', async () => {
		const locations = $state([makeLocation({ name: '' })])

		const { getByText } = render(LocationEditor, { locations })

		await expect.element(getByText('Unnamed')).toBeVisible()
	})

	it('renders locations collapsed by default', async () => {
		const locations = $state([makeLocation({ name: 'My Location' })])

		const { getByPlaceholder } = render(LocationEditor, { locations })

		await expect.element(getByPlaceholder('e.g. Eastern Palace')).not.toBeVisible()
	})

	it('shows location name input with correct value when expanded', async () => {
		const locations = $state([makeLocation({ name: 'Kakariko Village' })])

		const { getByPlaceholder } = render(LocationEditor, { locations })

		await expect.element(getByPlaceholder('e.g. Eastern Palace')).toHaveValue('Kakariko Village')
	})

	it('shows icon fields when expanded', async () => {
		const locations = $state([makeLocation()])

		const { getByText, getByPlaceholder } = render(LocationEditor, { locations })
		await getByText('Test Location').click() // expand the location

		// Inherit Icon From only appears in LocationEditor (not SectionEditor)
		await expect.element(getByText('Inherit Icon From')).toBeVisible()
		await expect.element(getByPlaceholder('parent_location_name')).toBeVisible()
	})

	it('shows access rules and visibility rules fields', async () => {
		const locations = $state([makeLocation({ sections: [] })])

		const { getByText } = render(LocationEditor, { locations })
		await getByText('Test Location').click() // expand the location

		// With no sections, these labels are unambiguously from LocationEditor
		await expect.element(getByText('Access Rules')).toBeVisible()
		await expect.element(getByText('Visibility Rules')).toBeVisible()
	})

	it('shows Sections divider when expanded', async () => {
		const locations = $state([makeLocation({ sections: [] })])

		const { getByText } = render(LocationEditor, { locations })
		await getByText('Test Location').click() // expand the location

		// The divider text "Sections" and nested SectionEditor both render
		await expect.element(getByText('No sections. Add one above.')).toBeVisible()
	})

	it('adds a new location when Add button is clicked', async () => {
		const locations = $state([makeLocation({ sections: [] })])

		const { getByRole } = render(LocationEditor, { locations })
		await getByRole('button', { name: 'Add' }).first().click()

		expect(locations).toHaveLength(2)
	})

	it('removes a location when remove button is clicked', async () => {
		const locations = $state([makeLocation()])

		const { getByRole } = render(LocationEditor, { locations })
		await getByRole('button', { name: 'Remove location' }).click()

		expect(locations).toHaveLength(0)
	})

	it('renders multiple locations', async () => {
		const locations = $state([
			makeLocation({ id: 'loc-1', name: 'Location A' }),
			makeLocation({ id: 'loc-2', name: 'Location B' })
		])

		const { getByText } = render(LocationEditor, { locations })

		await expect.element(getByText('Location A')).toBeVisible()
		await expect.element(getByText('Location B')).toBeVisible()
	})

	it('switches expanded location when another header is clicked', async () => {
		const locations = $state([
			makeLocation({ id: 'loc-1', name: 'Location A', sections: [] }),
			makeLocation({ id: 'loc-2', name: 'Location B', sections: [] })
		])

		const { getByText, getByPlaceholder } = render(LocationEditor, { locations })

		// Expand first location
		await getByText('Location A').click()

		// Only the first location's content is visible
		await expect.element(getByPlaceholder('e.g. Eastern Palace').first()).toBeVisible()
		await expect.element(getByPlaceholder('e.g. Eastern Palace').last()).not.toBeVisible()

		// Expand second location (collapses the first)
		await getByText('Location B').click()

		// Only the second location's content is visible
		await expect.element(getByPlaceholder('e.g. Eastern Palace').first()).not.toBeVisible()
		await expect.element(getByPlaceholder('e.g. Eastern Palace').last()).toBeVisible()
	})
})

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
