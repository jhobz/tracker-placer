import { describe, expect, it, beforeEach } from 'vitest'
import {
	appState,
	createMap,
	createPack,
	createLocationBox,
	createLocation,
	createSection
} from '$lib/state.svelte'

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

		expect(loc.id).toBeTruthy()
		expect(loc.name).toBe('New Location')
		expect(loc.chest_unopened_img).toBe('')
		expect(loc.chest_opened_img).toBe('')
		expect(loc.inherit_icon_from).toBe('')
		expect(loc.access_rules).toEqual([])
		expect(loc.visibility_rules).toEqual([])
		expect(loc.sections).toHaveLength(1)
		expect(loc.children).toEqual([])
		expect(loc.map_locations).toEqual([])
	})
})

describe('createLocationBox', () => {
	it('returns a box at the given coordinates with one location', () => {
		const box = createLocationBox(100, 200)

		expect(box.id).toBeTruthy()
		expect(box.x).toBe(100)
		expect(box.y).toBe(200)
		expect(box.size).toBe(0)
		expect(box.rectWidth).toBe(0)
		expect(box.rectHeight).toBe(0)
		expect(box.locations).toHaveLength(1)
	})
})

describe('createMap', () => {
	it('returns a map with default values and no boxes', () => {
		const map = createMap()

		expect(map.id).toBeTruthy()
		expect(map.name).toBe('New Map')
		expect(map.imageFile).toBeNull()
		expect(map.imageUrl).toBe('')
		expect(map.locationSize).toBe(16)
		expect(map.locationBorderThickness).toBe(1)
		expect(map.locationBoxes).toEqual([])
	})
})

// --- AppState tests ---

describe('appState', () => {
	beforeEach(() => {
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
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
			appState.selectedBoxId = 'old-box'
			appState.addMap()

			expect(appState.selectedBoxId).toBeNull()
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
			expect(appState.selectedBoxId).toBeNull()
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
			appState.selectedBoxId = 'some-box'
			appState.placingMode = true

			appState.selectMap(appState.maps[0].id)

			expect(appState.selectedMapId).toBe(appState.maps[0].id)
			expect(appState.selectedBoxId).toBeNull()
			expect(appState.placingMode).toBe(false)
		})
	})

	describe('selectedMap', () => {
		it('returns null when no map is selected', () => {
			expect(appState.selectedMap).toBeNull()
		})

		it('returns the selected map', () => {
			appState.addMap()

			expect(appState.selectedMap).toBe(appState.maps[0])
		})
	})

	describe('addLocationBox', () => {
		it('adds a box to the selected map and selects it', () => {
			appState.addMap()
			appState.addLocationBox(50, 75)

			expect(appState.selectedMap!.locationBoxes).toHaveLength(1)
			const box = appState.selectedMap!.locationBoxes[0]
			expect(box.x).toBe(50)
			expect(box.y).toBe(75)
			expect(appState.selectedBoxId).toBe(box.id)
		})

		it('disables placing mode after adding', () => {
			appState.addMap()
			appState.placingMode = true
			appState.addLocationBox(10, 20)

			expect(appState.placingMode).toBe(false)
		})

		it('does nothing if no map is selected', () => {
			appState.addLocationBox(10, 20)

			expect(appState.selectedBoxId).toBeNull()
		})
	})

	describe('removeLocationBox', () => {
		it('removes a box from the given map', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)
			const mapId = appState.maps[0].id
			const boxId = appState.selectedMap!.locationBoxes[0].id

			appState.removeLocationBox(mapId, boxId)

			expect(appState.selectedMap!.locationBoxes).toHaveLength(0)
		})

		it('clears selectedBoxId if the removed box was selected', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)
			const mapId = appState.maps[0].id
			const boxId = appState.selectedBoxId!

			appState.removeLocationBox(mapId, boxId)

			expect(appState.selectedBoxId).toBeNull()
		})

		it('does not clear selectedBoxId if a different box was removed', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)
			appState.addLocationBox(30, 40)
			const mapId = appState.maps[0].id
			const firstBoxId = appState.selectedMap!.locationBoxes[0].id
			// selectedBoxId is the second box (last added)

			appState.removeLocationBox(mapId, firstBoxId)

			expect(appState.selectedBoxId).not.toBeNull()
			expect(appState.selectedMap!.locationBoxes).toHaveLength(1)
		})

		it('does nothing for non-existent map id', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)

			appState.removeLocationBox('nonexistent', appState.selectedBoxId!)

			expect(appState.selectedMap!.locationBoxes).toHaveLength(1)
		})

		it('does nothing for non-existent box id', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)
			const mapId = appState.maps[0].id

			appState.removeLocationBox(mapId, 'nonexistent')

			expect(appState.selectedMap!.locationBoxes).toHaveLength(1)
		})
	})

	describe('selectedBox', () => {
		it('returns null when no box is selected', () => {
			expect(appState.selectedBox).toBeNull()
		})

		it('returns null when no map is selected', () => {
			appState.selectedBoxId = 'some-id'

			expect(appState.selectedBox).toBeNull()
		})

		it('returns the selected box', () => {
			appState.addMap()
			appState.addLocationBox(10, 20)

			expect(appState.selectedBox).toBe(appState.selectedMap!.locationBoxes[0])
		})
	})

	describe('selectBox', () => {
		it('sets selectedBoxId', () => {
			appState.selectBox('box-123')

			expect(appState.selectedBoxId).toBe('box-123')
		})
	})

	describe('toggleTheme', () => {
		it('toggles from dark to light', () => {
			appState.theme = 'dark'
			appState.toggleTheme()

			expect(appState.theme).toBe('light')
		})

		it('toggles from light to dark', () => {
			appState.theme = 'light'
			appState.toggleTheme()

			expect(appState.theme).toBe('dark')
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
			appState.selectedBoxId = 'some-box'

			appState.addPack()

			expect(appState.selectedMapId).toBeNull()
			expect(appState.selectedBoxId).toBeNull()
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
			appState.selectedBoxId = 'some-box'
			appState.addPack()

			appState.selectPack(appState.packs[0].id)

			expect(appState.selectedPackId).toBe(appState.packs[0].id)
			expect(appState.selectedMapId).toBe(appState.packs[0].maps[0].id)
			expect(appState.selectedBoxId).toBeNull()
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

			expect(appState.selectedPack).toBe(appState.packs[0])
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
