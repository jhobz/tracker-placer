import { describe, expect, it } from 'vitest'
import { LocationsTabContext } from './LocationsTabContext.svelte'

describe('LocationsTabContext', () => {
	it('can be instantiated', () => {
		const ctx = new LocationsTabContext()
		expect(ctx).toBeInstanceOf(LocationsTabContext)
	})

	it('walkDownPath sets currentLocation', () => {
		const ctx = new LocationsTabContext()
		const loc = { name: 'foo', children: [], map_locations: [], sections: [] }
		ctx.walkDownPath(loc)
		expect(ctx.currentLocation).toStrictEqual(loc)
	})

	it('walkUpPath(-1) resets currentLocation', () => {
		const ctx = new LocationsTabContext()
		ctx.walkDownPath({ name: 'foo', children: [], map_locations: [], sections: [] })
		ctx.walkUpPath(-1)
		expect(ctx.currentLocation).toBe(null)
	})

	it('addChildLocation adds a child', () => {
		const ctx = new LocationsTabContext()
		ctx.addChildLocation()
		expect(ctx.currentChildren.length).toBe(1)
	})
})
