import { appState, createLocation, createMap, createPack, createSection } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'

// --- Factory function tests ---

describe('createSection', () => {
	it('returns a section with default values', () => {
		const sec = createSection()

		expect(sec.id).toBeTruthy()
		expect(sec.name).toBe('New Section')
		expect(sec.item_count).toBe(1)
		expect(sec.hosted_item).toBe('')
		expect(sec.access_rules).toEqual([])
		expect(sec.visibility_rules).toEqual([])
		expect(sec.chest_unopened_img).toBe('')
		expect(sec.chest_opened_img).toBe('')
	})

	it('generates unique ids', () => {
		const a = createSection()
		const b = createSection()

		expect(a.id).not.toBe(b.id)
	})
})

describe('createLocation', () => {
	it('returns a location with default values and one section', () => {
		const loc = createLocation()

		expect(loc.name).toBe('New Location')
		expect(loc.chest_unopened_img).toBe('')
		expect(loc.chest_opened_img).toBe('')
		expect(loc.access_rules).toEqual([])
		expect(loc.visibility_rules).toEqual([])
		expect(loc.sections).toHaveLength(1)
		expect(loc.children).toEqual([])
		expect(loc.map_locations).toEqual([])
	})
})

describe('createMap', () => {
	it('returns a map with default values and no boxes', () => {
		const map = createMap()

		expect(map.id).toBeTruthy()
		expect(map.name).toBe('New Map')
		expect(map.imageFile).toBeNull()
		expect(map.imageUrl).toBe('')
		expect(map.location_size).toBe(42)
		expect(map.location_border_thickness).toBe(4)
		expect(map.location_shape).toBe('rect')
	})
})

// --- AppState tests ---

describe('appState', () => {
	beforeEach(() => {
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null
		appState.placingMode = false
		// Most tests need a pack context for map operations
		appState.addPack()
	})

	describe('addMap', () => {
		it('adds a map and selects it', () => {
			appState.addMap()

			expect(appState.maps).toHaveLength(1)
			expect(appState.selectedMapId).toBe(appState.maps[0].id)
		})

		it('clears selectedBoxId', () => {
			appState.selectedBox = { map: 'some-map', x: 10, y: 20 }
			appState.addMap()

			expect(appState.selectedBox).toBeNull()
		})

		it('creates a pack if none exist', () => {
			appState.packs.length = 0
			appState.selectedPackId = null

			appState.addMap()

			expect(appState.packs).toHaveLength(1)
			expect(appState.selectedPackId).toBe(appState.packs[0].id)
			expect(appState.maps).toHaveLength(1)
		})
	})

	describe('removeMap', () => {
		it('removes a map by id', () => {
			appState.addMap()
			const id = appState.maps[0].id
			appState.removeMap(id)

			expect(appState.maps).toHaveLength(0)
		})

		it('selects the first remaining map if the selected one is removed', () => {
			appState.addMap()
			appState.addMap()
			const firstId = appState.maps[0].id
			const secondId = appState.maps[1].id

			appState.selectedMapId = secondId
			appState.removeMap(secondId)

			expect(appState.selectedMapId).toBe(firstId)
		})

		it('sets selectedMapId to null when last map is removed', () => {
			appState.addMap()
			const id = appState.maps[0].id
			appState.removeMap(id)

			expect(appState.selectedMapId).toBeNull()
			expect(appState.selectedBox).toBeNull()
		})

		it('does nothing for non-existent id', () => {
			appState.addMap()
			appState.removeMap('nonexistent')

			expect(appState.maps).toHaveLength(1)
		})

		it('does not change selection when removing a non-selected map', () => {
			appState.addMap()
			appState.addMap()
			const firstId = appState.maps[0].id
			const secondId = appState.maps[1].id

			appState.selectedMapId = secondId
			appState.removeMap(firstId)

			expect(appState.selectedMapId).toBe(secondId)
		})
	})

	describe('selectMap', () => {
		it('sets selectedMapId and clears box selection and placing mode', () => {
			appState.addMap()
			appState.addMap()
			appState.selectedBox = { map: 'some-map', x: 10, y: 20 }
			appState.placingMode = true

			appState.selectMap(appState.maps[0].id)

			expect(appState.selectedMapId).toBe(appState.maps[0].id)
			expect(appState.selectedBox).toBeNull()
			expect(appState.placingMode).toBe(false)
		})
	})

	describe('selectedMap', () => {
		it('returns null when no map is selected', () => {
			expect(appState.selectedMap).toBeNull()
		})

		it('returns the selected map', () => {
			appState.addMap()

			expect(appState.selectedMap).toStrictEqual(appState.maps[0])
		})
	})

	describe('addLocationBox', () => {
		it('creates an ephemeral box and selects it', () => {
			appState.addMap()
			appState.addLocationBox(50, 75)

			expect(appState.selectedBox).toStrictEqual({ map: 'New Map', size: 0, x: 50, y: 75 })
		})

		it('disables placing mode after adding', () => {
			appState.addMap()
			appState.placingMode = true
			appState.addLocationBox(10, 20)

			expect(appState.placingMode).toBe(false)
		})

		it('does nothing if no map is selected', () => {
			appState.addLocationBox(10, 20)

			expect(appState.selectedBox).toBeNull()
		})
	})

	describe('removeLocationBox', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
			appState.selectedMapId = null
			appState.selectedBox = null
			appState.addMap()
			const location = createLocation()
			appState.selectedPack?.locations.push(location)
			appState.addLocationBox(10, 20)
			const box = appState.selectedBox!
			location.map_locations = [box]
		})

		it('removes a box from the given map', () => {
			const box = appState.selectedBox!
			expect(appState.packs[0].locations[0].map_locations).toHaveLength(1)

			appState.removeLocationBox(box)

			expect(appState.packs[0].locations[0].map_locations).toHaveLength(0)
		})

		it('clears selectedBox if the removed box was selected', () => {
			const box = appState.selectedBox!

			appState.removeLocationBox(box)

			expect(appState.selectedBox).toBeNull()
		})

		it('does not clear selectedBox if a different box was removed', () => {
			appState.addLocationBox(30, 40)
			const location = createLocation()
			appState.selectedPack?.locations.push(location)
			location.map_locations = [appState.selectedBox!]
			const firstBox = appState.packs[0].locations[0].map_locations![0]
			const secondBox = appState.packs[0].locations[1].map_locations![0]

			expect(appState.selectedBox).toStrictEqual(secondBox)

			appState.removeLocationBox(firstBox)

			expect(appState.selectedBox).not.toBeNull()
			expect(appState.packs[0].locations[0].map_locations).toHaveLength(0)
			expect(appState.packs[0].locations[1].map_locations).toHaveLength(1)
		})

		it('does nothing for non-existent box', () => {
			appState.removeLocationBox({ map: 'some-map', x: 0, y: 0 })

			expect(appState.packs[0].locations[0].map_locations).toHaveLength(1)
		})
	})

	describe('selectedBox', () => {
		it('returns null when no box is selected', () => {
			expect(appState.selectedBox).toBeNull()
		})

		it('returns null when no map is selected', () => {
			appState.selectedBox = { map: 'some-map', x: 10, y: 20 }

			expect(appState.selectedBox).toBeNull()
		})

		it('returns the selected box', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)

			expect(appState.selectedBox).toStrictEqual({ map: 'New Map', size: 0, x: 10, y: 20 })
		})
	})

	describe('selectBox', () => {
		it('sets selectedBox', () => {
			appState.addMap()
			const box = { map: 'some-map', x: 10, y: 20 }
			appState.selectBox(box)

			expect(appState.selectedBox).toStrictEqual(box)
		})
	})

	describe('toggleTheme', () => {
		it('toggles from poptracker to light', () => {
			appState.theme = 'poptracker'
			appState.toggleTheme()

			expect(appState.theme).toBe('light')
		})

		it('toggles from light to poptracker', () => {
			appState.theme = 'light'
			appState.toggleTheme()

			expect(appState.theme).toBe('poptracker')
		})
	})

	describe('addPack', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
		})

		it('adds a pack and selects it', () => {
			appState.addPack()

			expect(appState.packs).toHaveLength(1)
			expect(appState.selectedPackId).toBe(appState.packs[0].id)
		})

		it('clears map and box selection', () => {
			appState.addPack()
			appState.addMap()
			appState.selectedBox = { map: 'some-map', x: 10, y: 20 }

			appState.addPack()

			expect(appState.selectedMapId).toBeNull()
			expect(appState.selectedBox).toBeNull()
		})
	})

	describe('removePack', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
		})

		it('removes a pack by id', () => {
			appState.addPack()
			const id = appState.packs[0].id
			appState.removePack(id)

			expect(appState.packs).toHaveLength(0)
		})

		it('selects the first remaining pack if the selected one is removed', () => {
			appState.addPack()
			appState.addPack()
			const firstId = appState.packs[0].id
			const secondId = appState.packs[1].id

			appState.selectedPackId = secondId
			appState.removePack(secondId)

			expect(appState.selectedPackId).toBe(firstId)
		})

		it('sets selectedPackId to null when last pack is removed', () => {
			appState.addPack()
			const id = appState.packs[0].id
			appState.removePack(id)

			expect(appState.selectedPackId).toBeNull()
		})

		it('does nothing for non-existent id', () => {
			appState.addPack()
			appState.removePack('nonexistent')

			expect(appState.packs).toHaveLength(1)
		})
	})

	describe('selectPack', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
		})

		it('sets selectedPackId, selects the first map (if one exists), and clears box selection', () => {
			appState.addPack()
			appState.addMap()
			appState.selectedBox = { map: 'some-map', x: 10, y: 20 }
			appState.addPack()

			appState.selectPack(appState.packs[0].id)

			expect(appState.selectedPackId).toBe(appState.packs[0].id)
			expect(appState.selectedMapId).toBe(appState.packs[0].maps[0].id)
			expect(appState.selectedBox).toBeNull()
		})

		it('does nothing when selecting the already-selected pack', () => {
			appState.addPack()
			appState.addMap()
			const mapId = appState.selectedMapId

			appState.selectPack(appState.packs[0].id)

			expect(appState.selectedMapId).toBe(mapId)
		})
	})

	describe('selectedPack', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
		})

		it('returns null when no pack is selected', () => {
			expect(appState.selectedPack).toBeNull()
		})

		it('returns the selected pack', () => {
			appState.addPack()

			expect(appState.selectedPack).toStrictEqual(appState.packs[0])
		})
	})

	describe('maps with packs', () => {
		beforeEach(() => {
			appState.packs.length = 0
			appState.selectedPackId = null
		})

		it('returns empty array when no pack is selected', () => {
			expect(appState.maps).toEqual([])
		})

		it('returns selected pack maps', () => {
			appState.addPack()
			appState.addMap()

			expect(appState.maps).toHaveLength(1)
			expect(appState.selectedPack!.maps).toHaveLength(1)
		})

		it('maps are scoped to each pack', () => {
			appState.addPack()
			appState.addMap()
			const firstPackId = appState.packs[0].id

			appState.addPack()
			expect(appState.maps).toHaveLength(0)

			appState.selectPack(firstPackId)
			expect(appState.maps).toHaveLength(1)
		})
	})
})

describe('createPack', () => {
	it('returns a pack with default values and no maps', () => {
		const pack = createPack()

		expect(pack.id).toBeTruthy()
		expect(pack.name).toBe('New Pack')
		expect(pack.maps).toEqual([])
	})

	it('generates unique ids', () => {
		const a = createPack()
		const b = createPack()

		expect(a.id).not.toBe(b.id)
	})
})
