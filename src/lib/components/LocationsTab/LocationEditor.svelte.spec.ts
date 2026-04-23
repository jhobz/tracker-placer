import { appState } from '$lib/state.svelte'
import type { Location, PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import LocationEditorTestWrapper from './LocationEditorTestWrapper.svelte'
import { LocationsTabContext } from './LocationsTabContext.svelte'

describe('LocationEditor', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.addPack()
	})

	it('renders empty state when no location', async () => {
		const location = $state(null as unknown as Location)

		expect(() => render(LocationEditorTestWrapper, { location })).toThrow(
			'LocationEditor requires a valid location prop'
		)
	})

	it('renders a location input with its name', async () => {
		const location = $state(makeLocation({ name: 'Eastern Palace' }))

		const { getByLabelText } = render(LocationEditorTestWrapper, { location })

		await expect.element(getByLabelText('Location Name')).toBeVisible()
		await expect.element(getByLabelText('Location Name')).toHaveValue('Eastern Palace')
	})

	it('shows icon fields', async () => {
		const location = $state(makeLocation())

		const { getByRole } = render(LocationEditorTestWrapper, { location })

		await expect.element(getByRole('textbox', { name: 'Chest Unopened Img' })).toBeVisible()
		await expect.element(getByRole('textbox', { name: 'Chest Opened Img' })).toBeVisible()
	})

	it('shows access rules and visibility rules fields', async () => {
		const location = $state(makeLocation({ sections: [] }))

		const { getByText } = render(LocationEditorTestWrapper, { location })

		// With no sections, these labels are unambiguously from LocationEditor
		await expect.element(getByText('Access Rules')).toBeVisible()
		await expect.element(getByText('Visibility Rules')).toBeVisible()
	})

	it('shows Sections divider', async () => {
		const location = $state(makeLocation({ sections: [] }))

		const { getByText } = render(LocationEditorTestWrapper, { location })

		await expect.element(getByText('No sections. Add one above.')).toBeVisible()
	})

	it('adds a new child location when "Add location" button is clicked', async () => {
		const location = $state(makeLocation({ name: 'Test Location', sections: [] }))
		appState.selectedPack!.locations.push(location)

		const { getByRole, getByText } = render(LocationEditorTestWrapper, { location })
		await expect.element(getByText('New Location')).not.toBeInTheDocument()
		await getByRole('button', { name: 'Add location' }).click()

		await expect.element(getByText('New Location')).toBeVisible()
	})

	it('deletes a location when delete button is clicked', async () => {
		const location = $state(makeLocation())
		appState.selectedPack!.locations.push(location)
		const context = new LocationsTabContext()
		context.walkDownPath(location)

		const { getByRole } = render(LocationEditorTestWrapper, { props: { location, context } })
		await getByRole('button', { name: 'Delete location' }).click()

		expect(appState.selectedPack!.locations).toHaveLength(0)
	})

	it('renders list of children locations', async () => {
		const children = $state([
			makeLocation({ name: 'Location A' }),
			makeLocation({ name: 'Location B' })
		])
		const location = $state(makeLocation({ children }))
		appState.selectedPack!.locations.push(location)
		const context = new LocationsTabContext()
		context.walkDownPath(location)

		const { getByText } = render(LocationEditorTestWrapper, { props: { location, context } })

		await expect.element(getByText('Location A')).toBeVisible()
		await expect.element(getByText('Location B')).toBeVisible()
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

function makeLocation(overrides: Partial<Location> = {}): Location {
	return {
		name: 'Test Location',
		chest_unopened_img: '',
		chest_opened_img: '',
		access_rules: [],
		visibility_rules: [],
		sections: [makeSection()],
		children: [],
		map_locations: [],
		...overrides
	}
}
