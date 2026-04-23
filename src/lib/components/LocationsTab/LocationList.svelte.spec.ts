import type { Location } from '$lib/types'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LocationListWrapper from './LocationListWrapper.svelte'
import { LocationsTabContext } from './LocationsTabContext.svelte'

describe('LocationList', () => {
	it('renders a list of locations', async () => {
		const locations = [makeLocation({ name: 'Location A' }), makeLocation({ name: 'Location B' })]

		const { getByText } = render(LocationListWrapper, { locations })

		await expect.element(getByText('Location A')).toBeVisible()
		await expect.element(getByText('Location B')).toBeVisible()
	})

	it('shows no locations found if empty', async () => {
		const { getByText } = render(LocationListWrapper, { locations: [] })

		await expect.element(getByText('No locations found')).toBeVisible()
	})

	it('calls context.walkDownPath when button clicked', async () => {
		const context = new MockContext()
		const locations = [makeLocation()]

		const { getByRole } = render(LocationListWrapper, {
			props: {
				locations,
				context
			}
		})
		await getByRole('button', { name: 'View location details' }).click()

		expect(context.called).toBe(true)
	})

	it('calls context.addChildLocation when add button clicked', async () => {
		const context = new MockContext()
		const locations = [makeLocation()]

		const { getByRole } = render(LocationListWrapper, {
			props: {
				locations,
				context
			}
		})
		await getByRole('button', { name: 'Add location' }).click()

		expect(context.called).toBe(true)
	})
})

class MockContext extends LocationsTabContext {
	called = false

	walkDownPath(location: Location) {
		this.called = !!location
	}

	addChildLocation() {
		this.called = true
	}
}

function makeLocation(partial: Partial<Location> = {}): Location {
	return { name: 'Test Location', children: [], map_locations: [], sections: [], ...partial }
}
