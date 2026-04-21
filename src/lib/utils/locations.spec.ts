import type { Location, MapLocation } from '$lib/types'
import { describe, expect, it } from 'vitest'
import {
	areMapLocationsEqual,
	findAllLocationsContainingMapLocation,
	findAllMapLocationsForMap,
	findLocationByName
} from './locations'

describe('findAllMapLocations', () => {
	const makeLoc = (partial: Partial<Location>): Location => ({
		name: '',
		map_locations: [],
		children: [],
		sections: [],
		...partial
	})

	it('returns empty array if no locations', () => {
		expect(findAllMapLocationsForMap([], 'map1')).toEqual([])
	})

	it('returns empty array if no matches', () => {
		const locs = [makeLoc({ map_locations: [{ map: 'other', x: 1, y: 2 }] })]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([])
	})

	it('finds direct matches', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ map_locations: [ml] })]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([ml])
	})

	it('finds matches that are not equal by reference', () => {
		const ml1 = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ map_locations: [ml1] }), makeLoc({ map_locations: [ml2] })]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([ml1, ml2])
	})

	it('returns references to the map locations, not copies', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ map_locations: [ml] })]
		const result = findAllMapLocationsForMap(locs, 'map1')
		expect(result[0]).toBe(ml)
		result[0].x = 42
		expect(ml.x).toBe(42)
	})

	it('finds matches in children', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ children: [makeLoc({ map_locations: [ml] })] })]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([ml])
	})

	it('finds multiple matches at all depths', () => {
		const ml1 = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map1', x: 3, y: 4 }
		const ml3 = { map: 'map2', x: 5, y: 6 }
		const locs = [
			makeLoc({ map_locations: [ml1, ml3] }),
			makeLoc({ children: [makeLoc({ map_locations: [ml2] })] })
		]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([ml1, ml2])
	})

	it('returns empty array if map_locations is undefined everywhere', () => {
		const locs = [makeLoc({ map_locations: undefined })]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([])
	})

	it('handles deeply nested children', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [
			makeLoc({ children: [makeLoc({ children: [makeLoc({ map_locations: [ml] })] })] })
		]
		expect(findAllMapLocationsForMap(locs, 'map1')).toEqual([ml])
	})
})

describe('findAllLocationsContainingMapLocation', () => {
	const makeLoc = (partial: Partial<Location>): Location => ({
		name: '',
		map_locations: [],
		children: [],
		sections: [],
		...partial
	})

	it('returns empty array if no locations', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		expect(findAllLocationsContainingMapLocation([], ml)).toEqual([])
	})

	it('returns empty array if no matches', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ map_locations: [{ map: 'other', x: 1, y: 2 }] })]
		expect(findAllLocationsContainingMapLocation(locs, ml)).toEqual([])
	})

	it('finds direct matches by reference', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const loc = makeLoc({ map_locations: [ml] })
		expect(findAllLocationsContainingMapLocation([loc], ml)).toEqual([loc])
	})

	it('finds matches by deep equality', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		const loc = makeLoc({ map_locations: [ml2] })
		expect(findAllLocationsContainingMapLocation([loc], ml)).toEqual([loc])
	})

	it('finds matches in children', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const child = makeLoc({ map_locations: [ml] })
		const parent = makeLoc({ children: [child] })
		expect(findAllLocationsContainingMapLocation([parent], ml)).toEqual([child])
	})

	it('finds multiple matches at all depths', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const loc1 = makeLoc({ map_locations: [ml] })
		const loc2 = makeLoc({ children: [makeLoc({ map_locations: [ml] })] })
		expect(findAllLocationsContainingMapLocation([loc1, loc2], ml)).toEqual([
			loc1,
			loc2.children?.[0]
		])
	})

	it('returns empty array if map_locations is undefined everywhere', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const locs = [makeLoc({ map_locations: undefined })]
		expect(findAllLocationsContainingMapLocation(locs, ml)).toEqual([])
	})

	it('handles deeply nested children', () => {
		const ml = { map: 'map1', x: 1, y: 2 }
		const deep = makeLoc({ children: [makeLoc({ children: [makeLoc({ map_locations: [ml] })] })] })
		expect(findAllLocationsContainingMapLocation([deep], ml)).toEqual([
			deep.children?.[0]?.children?.[0]
		])
	})
})

describe('areMapLocationsEqual', () => {
	it('returns true for identical objects', () => {
		const ml1 = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(true)
	})

	it('returns false for different map values', () => {
		const ml1 = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map2', x: 1, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(false)
	})

	it('returns false for different x values', () => {
		const ml1 = { map: 'map1', x: 1, y: 2 }
		const ml2 = { map: 'map1', x: 2, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(false)
	})

	it('returns false for missing keys', () => {
		const ml1 = { map: 'map1', x: 1 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(false)
		expect(areMapLocationsEqual(ml2, ml1)).toBe(false)
	})

	it('returns false for extra keys', () => {
		const ml1 = { map: 'map1', x: 1, y: 2, size: 5 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(false)
		expect(areMapLocationsEqual(ml2, ml1)).toBe(false)
	})

	it('returns true for objects with same keys and values in different order', () => {
		const ml1 = { x: 1, map: 'map1', y: 2 }
		const ml2 = { map: 'map1', x: 1, y: 2 }
		expect(areMapLocationsEqual(ml1, ml2)).toBe(true)
	})

	it('returns true when all possible properties are present and equal', () => {
		const ml1 = {
			map: 'map1',
			x: 1,
			y: 2,
			size: 5,
			border_thickness: 1,
			shape: 'rect',
			restrict_visibility_rules: [['rule1', 'rule2']],
			force_invisibility_rules: ['rule3']
		} satisfies MapLocation
		const ml2 = {
			map: 'map1',
			x: 1,
			y: 2,
			size: 5,
			border_thickness: 1,
			shape: 'rect',
			restrict_visibility_rules: [['rule1', 'rule2']],
			force_invisibility_rules: ['rule3']
		} satisfies MapLocation
		expect(areMapLocationsEqual(ml1, ml2)).toBe(true)
	})

	it('deeply compares rules arrays and ignores order', () => {
		const ml1 = {
			restrict_visibility_rules: [['rule1', 'rule2'], ['rule3']],
			force_invisibility_rules: ['rule4', 'rule5']
		} satisfies MapLocation
		const ml2 = {
			restrict_visibility_rules: [['rule3'], ['rule2', 'rule1']],
			force_invisibility_rules: ['rule5', 'rule4']
		} satisfies MapLocation
		const ml3 = {
			restrict_visibility_rules: [['rule3'], ['rule2', 'rule1']],
			force_invisibility_rules: 'rule5'
		} satisfies MapLocation
		expect(areMapLocationsEqual(ml1, ml2)).toBe(true)
		expect(areMapLocationsEqual(ml1, ml3)).toBe(false)
		expect(areMapLocationsEqual(ml2, ml3)).toBe(false)
	})
})

describe('findLocationByName', () => {
	const makeLoc = (partial: Partial<Location>): Location => ({
		name: '',
		map_locations: [],
		children: [],
		sections: [],
		...partial
	})

	it('returns null if locations is empty', () => {
		expect(findLocationByName([], 'foo')).toBeNull()
	})

	it('returns null if locations is null', () => {
		expect(findLocationByName(null as unknown as Location[], 'foo')).toBeNull()
	})

	it('finds a location by name at root', () => {
		const loc = makeLoc({ name: 'foo' })
		expect(findLocationByName([loc], 'foo')).toBe(loc)
	})

	it('finds a location by name in children', () => {
		const child = makeLoc({ name: 'bar' })
		const parent = makeLoc({ name: 'parent', children: [child] })
		expect(findLocationByName([parent], 'bar')).toBe(child)
	})

	it('returns null if name not found', () => {
		const loc = makeLoc({ name: 'foo' })
		expect(findLocationByName([loc], 'bar')).toBeNull()
	})

	it('finds the first match in depth-first order', () => {
		const child1 = makeLoc({ name: 'foo' })
		const child2 = makeLoc({ name: 'foo' })
		const parent = makeLoc({ children: [child1, child2] })
		expect(findLocationByName([parent], 'foo')).toBe(child1)
	})
})
