import { describe, expect, it } from 'vitest'
import type { LocationBox, MapConfig, PoptrackerLocation, PoptrackerSection } from '../types'
import { exportLocationsJson, exportMapsJson } from './export'

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
		sections: [],
		children: [],
		map_locations: [],
		...overrides
	}
}

function makeBox(overrides: Partial<LocationBox> = {}): LocationBox {
	return {
		id: 'box-1',
		x: 100.7,
		y: 200.3,
		size: 0,
		rectWidth: 0,
		rectHeight: 0,
		locations: [],
		...overrides
	}
}

function makeMap(overrides: Partial<MapConfig> = {}): MapConfig {
	return {
		id: 'map-1',
		name: 'Overworld',
		imageFile: null,
		imageUrl: '',
		locationSize: 16,
		locationBorderThickness: 1,
		locationBoxes: [],
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
		const location = makeLocation({ name: 'Chest Room' })
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('Chest Room')
	})

	it('rounds map_locations x and y to integers', () => {
		const location = makeLocation()
		const box = makeBox({ x: 100.7, y: 200.3, locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].map_locations![0].x).toBe(101)
		expect(result[0].map_locations![0].y).toBe(200)
	})

	it('includes map name in map_locations reference', () => {
		const location = makeLocation()
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ name: 'Overworld', locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].map_locations![0].map).toBe('Overworld')
	})

	it('omits size from map_locations when box size is 0', () => {
		const location = makeLocation()
		const box = makeBox({ size: 0, locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].map_locations![0]).not.toHaveProperty('size')
	})

	it('includes size in map_locations when box size > 0', () => {
		const location = makeLocation()
		const box = makeBox({ size: 24, locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].map_locations![0].size).toBe(24)
	})

	it('includes rect_width and rect_height when > 0', () => {
		const location = makeLocation()
		const box = makeBox({ rectWidth: 32, rectHeight: 48, locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)
		const mapLoc = result[0].map_locations![0]

		expect(mapLoc.rect_width).toBe(32)
		expect(mapLoc.rect_height).toBe(48)
	})

	it('omits rect_width and rect_height when 0', () => {
		const location = makeLocation()
		const box = makeBox({ rectWidth: 0, rectHeight: 0, locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)
		const mapLoc = result[0].map_locations![0]

		expect(mapLoc).not.toHaveProperty('rect_width')
		expect(mapLoc).not.toHaveProperty('rect_height')
	})

	it('omits optional location fields when empty', () => {
		const location = makeLocation()
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0]).not.toHaveProperty('chest_unopened_img')
		expect(result[0]).not.toHaveProperty('chest_opened_img')
		expect(result[0]).not.toHaveProperty('inherit_icon_from')
		expect(result[0]).not.toHaveProperty('access_rules')
		expect(result[0]).not.toHaveProperty('visibility_rules')
	})

	it('includes optional location fields when set', () => {
		const location = makeLocation({
			chest_unopened_img: 'chest.png',
			chest_opened_img: 'chest_open.png',
			inherit_icon_from: 'parent'
		})
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].chest_unopened_img).toBe('chest.png')
		expect(result[0].chest_opened_img).toBe('chest_open.png')
		expect(result[0].inherit_icon_from).toBe('parent')
	})

	it('parses access_rules into nested arrays', () => {
		const location = makeLocation({
			access_rules: ['has_hookshot', 'has_bow']
		})
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].access_rules).toEqual([['has_hookshot'], ['has_bow']])
	})

	it('parses visibility_rules into nested arrays', () => {
		const location = makeLocation({
			visibility_rules: ['map_revealed']
		})
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].visibility_rules).toEqual([['map_revealed']])
	})

	it('trims whitespace and filters empty rules', () => {
		const location = makeLocation({
			access_rules: ['  has_hookshot  ', '', '  ', 'has_bow']
		})
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].access_rules).toEqual([['has_hookshot'], ['has_bow']])
	})

	it('exports sections with all fields', () => {
		const section = makeSection({
			name: 'Item',
			item_count: 3,
			hosted_item: 'sword',
			access_rules: ['has_key'],
			visibility_rules: ['boss_defeated'],
			chest_unopened_img: 'big_chest.png',
			chest_opened_img: 'big_chest_open.png'
		})
		const location = makeLocation({ sections: [section] })
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)
		const sec = result[0].sections![0]

		expect(sec.name).toBe('Item')
		expect(sec.item_count).toBe(3)
		expect(sec.hosted_item).toBe('sword')
		expect(sec.access_rules).toEqual([['has_key']])
		expect(sec.visibility_rules).toEqual([['boss_defeated']])
		expect(sec.chest_unopened_img).toBe('big_chest.png')
		expect(sec.chest_opened_img).toBe('big_chest_open.png')
	})

	it('omits item_count from section when it equals 1', () => {
		const section = makeSection({ item_count: 1 })
		const location = makeLocation({ sections: [section] })
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].sections![0]).not.toHaveProperty('item_count')
	})

	it('includes item_count when not 1', () => {
		const section = makeSection({ item_count: 5 })
		const location = makeLocation({ sections: [section] })
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].sections![0].item_count).toBe(5)
	})

	it('omits optional section fields when empty', () => {
		const section = makeSection()
		const location = makeLocation({ sections: [section] })
		const box = makeBox({ locations: [location] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)
		const sec = result[0].sections![0]

		expect(sec).not.toHaveProperty('hosted_item')
		expect(sec).not.toHaveProperty('access_rules')
		expect(sec).not.toHaveProperty('visibility_rules')
		expect(sec).not.toHaveProperty('chest_unopened_img')
		expect(sec).not.toHaveProperty('chest_opened_img')
	})

	it('exports children locations recursively', () => {
		const child = makeLocation({ id: 'child-1', name: 'Inner Room' })
		const parent = makeLocation({ name: 'Dungeon', children: [child] })
		const box = makeBox({ locations: [parent] })
		const maps = [makeMap({ locationBoxes: [box] })]

		const result = exportLocationsJson(maps)

		expect(result[0].children).toHaveLength(1)
		expect(result[0].children![0].name).toBe('Inner Room')
		expect(result[0].children![0].map_locations![0].map).toBe('Overworld')
	})

	it('collects locations from multiple boxes across multiple maps', () => {
		const loc1 = makeLocation({ name: 'Loc A' })
		const loc2 = makeLocation({ name: 'Loc B' })
		const loc3 = makeLocation({ name: 'Loc C' })

		const box1 = makeBox({ locations: [loc1] })
		const box2 = makeBox({ locations: [loc2, loc3] })

		const map1 = makeMap({ name: 'Map 1', locationBoxes: [box1] })
		const map2 = makeMap({ name: 'Map 2', locationBoxes: [box2] })

		const result = exportLocationsJson([map1, map2])

		expect(result).toHaveLength(3)
		expect(result[0].name).toBe('Loc A')
		expect(result[0].map_locations![0].map).toBe('Map 1')
		expect(result[1].name).toBe('Loc B')
		expect(result[1].map_locations![0].map).toBe('Map 2')
		expect(result[2].name).toBe('Loc C')
	})

	it('returns empty array when no maps have locations', () => {
		const maps = [makeMap()]

		expect(exportLocationsJson(maps)).toEqual([])
	})
})
