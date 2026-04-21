import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LocationsTab from './LocationsTab.svelte'

// This is a basic smoke test. More detailed tests would require more setup/mocking.
describe('LocationsTab', () => {
	it('renders without crashing', () => {
		const { container } = render(LocationsTab)
		expect(container).toBeTruthy()
	})

	it('shows info alert when no path', () => {
		const { getByText } = render(LocationsTab)
		expect(getByText('Manage all locations in the pack.')).toBeTruthy()
	})

	it('renders breadcrumbs', () => {
		const { getByText } = render(LocationsTab)
		expect(getByText('Locations')).toBeTruthy()
	})
})
