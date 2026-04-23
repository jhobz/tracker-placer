import { describe, expect, it } from 'vitest'
import type { Location, MapConfig, MapLocation, PackConfig, PoptrackerSection } from '../types'
import { exportLocationsJson, exportMapsJson, ExportValidationError } from './export'

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
		sections: [],
		children: [],
		map_locations: [],
		...overrides
	}
}

function makeBox(overrides: Partial<MapLocation> = {}): MapLocation {
	return {
		x: 100.7,
		y: 200.3,
		size: 0,
		...overrides
	}
}

function makeMap(overrides: Partial<MapConfig> = {}): MapConfig {
	return {
		id: 'map-1',
		name: 'Overworld',
		imageFile: null,
		imageUrl: '',
		location_size: 16,
		location_border_thickness: 1,
		location_shape: 'rect',
		...overrides
	}
}

function makePack(overrides: Partial<PackConfig> = {}): PackConfig {
	return {
		id: 'pack-1',
		name: 'Test Pack',
		maps: [],
		locations: [],
		...overrides
	}
}

// --- exportMapsJson ---

describe('exportMapsJson', () => {
	it('exports basic map properties', () => {
		const maps = [makeMap()]
		const result = exportMapsJson(maps)

		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			name: 'Overworld',
			location_size: 16,
			location_border_thickness: 1,
			location_shape: 'rect',
			img: 'images/maps/overworld.png'
		})
	})

	it('converts map name with spaces to snake_case for img path', () => {
		const maps = [makeMap({ name: 'Dark World' })]
		const result = exportMapsJson(maps)

		expect(result[0].img).toBe('images/maps/dark_world.png')
	})

	it('handles multiple consecutive spaces in map name', () => {
		const maps = [makeMap({ name: 'Light   World' })]
		const result = exportMapsJson(maps)

		expect(result[0].img).toBe('images/maps/light_world.png')
	})

	it('exports multiple maps', () => {
		const maps = [makeMap({ name: 'Overworld' }), makeMap({ id: 'map-2', name: 'Dungeon' })]
		const result = exportMapsJson(maps)

		expect(result).toHaveLength(2)
		expect(result[0].name).toBe('Overworld')
		expect(result[1].name).toBe('Dungeon')
	})

	it('returns empty array for no maps', () => {
		expect(exportMapsJson([])).toEqual([])
	})
})

// --- exportLocationsJson ---

describe('exportLocationsJson', () => {
	it('exports a location with basic fields', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location = makeLocation({ name: 'Chest Room', map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('Chest Room')
	})

	it('rounds map_locations x and y to integers', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ x: 100.7, y: 200.3 })
		const location = makeLocation({ map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].map_locations![0].x).toBe(101)
		expect(result[0].map_locations![0].y).toBe(200)
	})

	it('includes map name in map_locations reference', () => {
		const pack = makePack()
		const maps = [makeMap({ name: 'Overworld' })]
		const box = makeBox({ map: maps[0].name })
		const location = makeLocation({ map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].map_locations![0].map).toBe('Overworld')
	})

	it('omits size from map_locations when box size is 0', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ size: 0, map: maps[0].name })
		const location = makeLocation({ map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].map_locations![0]).not.toHaveProperty('size')
	})

	it('includes size in map_locations when box size > 0', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ size: 24, map: maps[0].name })
		const location = makeLocation({ map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].map_locations![0].size).toBe(24)
	})

	it('omits optional location fields when empty', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location = makeLocation({ map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0]).not.toHaveProperty('chest_unopened_img')
		expect(result[0]).not.toHaveProperty('chest_opened_img')
		expect(result[0]).not.toHaveProperty('inherit_icon_from')
		expect(result[0]).not.toHaveProperty('access_rules')
		expect(result[0]).not.toHaveProperty('visibility_rules')
	})

	it('includes optional location fields when set', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location = makeLocation({
			chest_unopened_img: 'chest.png',
			chest_opened_img: 'chest_open.png',
			map_locations: [box]
		})
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].chest_unopened_img).toBe('chest.png')
		expect(result[0].chest_opened_img).toBe('chest_open.png')
	})

	it('handles access_rules as a string, an array of strings, or an array of string arrays', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location1 = makeLocation({
			access_rules: 'has_hookshot,has_bow',
			map_locations: [box]
		})
		const location2 = makeLocation({
			access_rules: ['has_hookshot', 'has_bow'],
			map_locations: [box]
		})
		const location3 = makeLocation({
			access_rules: [['has_hookshot', 'has_bow'], ['has_boots']],
			map_locations: [box]
		})
		pack.maps.push(maps[0])
		pack.locations.push(location1, location2, location3)

		const result = exportLocationsJson(pack)

		expect(result[0].access_rules).toEqual('has_hookshot,has_bow')
		expect(result[1].access_rules).toEqual(['has_hookshot', 'has_bow'])
		expect(result[2].access_rules).toEqual([['has_hookshot', 'has_bow'], ['has_boots']])
	})

	it('handles visibility_rules as a string, an array of strings, or an array of string arrays', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location1 = makeLocation({
			visibility_rules: 'map_revealed',
			map_locations: [box]
		})
		const location2 = makeLocation({
			visibility_rules: ['map_revealed'],
			map_locations: [box]
		})
		const location3 = makeLocation({
			visibility_rules: [['map_revealed']],
			map_locations: [box]
		})
		pack.maps.push(maps[0])
		pack.locations.push(location1, location2, location3)

		const result = exportLocationsJson(pack)

		expect(result[0].visibility_rules).toEqual('map_revealed')
		expect(result[1].visibility_rules).toEqual(['map_revealed'])
		expect(result[2].visibility_rules).toEqual([['map_revealed']])
	})

	it('trims whitespace and filters empty rules', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const location = makeLocation({
			access_rules: ['  has_hookshot  ', '', '  ', 'has_bow'],
			map_locations: [box]
		})
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].access_rules).toEqual(['has_hookshot', 'has_bow'])
	})

	it('exports sections with all fields', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const section = makeSection({
			name: 'Item',
			item_count: 3,
			hosted_item: 'sword',
			access_rules: ['has_key'],
			visibility_rules: ['boss_defeated'],
			chest_unopened_img: 'big_chest.png',
			chest_opened_img: 'big_chest_open.png'
		})
		const location = makeLocation({ sections: [section], map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)
		const sec = result[0].sections![0]

		expect(sec.name).toBe('Item')
		expect(sec.item_count).toBe(3)
		expect(sec.hosted_item).toBe('sword')
		expect(sec.access_rules).toEqual(['has_key'])
		expect(sec.visibility_rules).toEqual(['boss_defeated'])
		expect(sec.chest_unopened_img).toBe('big_chest.png')
		expect(sec.chest_opened_img).toBe('big_chest_open.png')
	})

	it('omits item_count from section when it equals 1', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const section = makeSection({ item_count: 1 })
		const location = makeLocation({ sections: [section], map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].sections![0]).not.toHaveProperty('item_count')
	})

	it('includes item_count when not 1', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const section = makeSection({ item_count: 5 })
		const location = makeLocation({ sections: [section], map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)

		expect(result[0].sections![0].item_count).toBe(5)
	})

	it('fails validation when item_count is less than 0', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const section = makeSection({ item_count: -1 })
		const location = makeLocation({ sections: [section], map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		expect(() => exportLocationsJson(pack)).toThrow(ExportValidationError)
		expect(() => exportLocationsJson(pack)).toThrow(
			'Validation failed for locations.json: /0/sections/0/item_count must be >= 0'
		)
	})

	it('omits optional section fields when empty', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const section = makeSection()
		const location = makeLocation({ sections: [section], map_locations: [box] })
		pack.maps.push(maps[0])
		pack.locations.push(location)

		const result = exportLocationsJson(pack)
		const sec = result[0].sections![0]

		expect(sec).not.toHaveProperty('hosted_item')
		expect(sec).not.toHaveProperty('access_rules')
		expect(sec).not.toHaveProperty('visibility_rules')
		expect(sec).not.toHaveProperty('chest_unopened_img')
		expect(sec).not.toHaveProperty('chest_opened_img')
	})

	it('exports children locations recursively', () => {
		const pack = makePack()
		const maps = [makeMap()]
		const box = makeBox({ map: maps[0].name })
		const child = makeLocation({ name: 'Inner Room', map_locations: [box] })
		const parent = makeLocation({ name: 'Dungeon', children: [child] })
		pack.maps.push(maps[0])
		pack.locations.push(parent)

		const result = exportLocationsJson(pack)

		expect(result[0].children).toHaveLength(1)
		expect(result[0].children![0].name).toBe('Inner Room')
		expect(result[0].children![0].map_locations![0].map).toBe('Overworld')
	})

	it('collects locations from multiple boxes across multiple maps', () => {
		const pack = makePack()
		const loc1 = makeLocation({ name: 'Loc A', map_locations: [makeBox({ map: 'Map 1' })] })
		const loc2 = makeLocation({ name: 'Loc B', map_locations: [makeBox({ map: 'Map 2' })] })
		const loc3 = makeLocation({ name: 'Loc C', map_locations: [makeBox({ map: 'Map 2' })] })

		const map1 = makeMap({ name: 'Map 1' })
		const map2 = makeMap({ name: 'Map 2' })
		pack.maps.push(map1, map2)
		pack.locations.push(loc1, loc2, loc3)

		const result = exportLocationsJson(pack)

		expect(result).toHaveLength(3)
		expect(result[0].name).toBe('Loc A')
		expect(result[0].map_locations![0].map).toBe('Map 1')
		expect(result[1].name).toBe('Loc B')
		expect(result[1].map_locations![0].map).toBe('Map 2')
		expect(result[2].name).toBe('Loc C')
		expect(result[2].map_locations![0].map).toBe('Map 2')
	})

	it('returns empty array when no maps have locations', () => {
		const pack = makePack()

		expect(exportLocationsJson(pack)).toEqual([])
	})
})
