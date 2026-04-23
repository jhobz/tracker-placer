import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LocationsTabWrapper from './LocationsTabWrapper.svelte'

// This is a basic smoke test. More detailed tests would require more setup/mocking.
describe('LocationsTab', () => {
	it('renders without crashing', async () => {
		const { container } = render(LocationsTabWrapper)
		await expect.element(container).toBeVisible()
	})

	it('shows info alert when no path', async () => {
		const { getByText } = render(LocationsTabWrapper)
		await expect.element(getByText('Manage all locations in the pack.')).toBeVisible()
	})

	it('renders breadcrumbs', async () => {
		const { getByRole } = render(LocationsTabWrapper)
		await expect.element(getByRole('button', { name: 'Locations' })).toBeVisible()
	})
})
