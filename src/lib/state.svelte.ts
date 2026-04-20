import localforage from 'localforage'
import { nanoid } from 'nanoid'
import type { Location, MapConfig, MapLocation, PackConfig, PoptrackerSection } from './types'
import { areMapLocationsEqual, findAllLocationsContainingMapLocation } from './utils/locations'

const store = localforage.createInstance({
	name: 'tracker-placer',
	storeName: 'app_state',
	driver: localforage.INDEXEDDB,
	version: 3
})

export function createPack(): PackConfig {
	return {
		id: nanoid(),
		name: 'New Pack',
		maps: [],
		locations: []
	}
}

export function createMap(): MapConfig {
	return {
		id: nanoid(),
		name: 'New Map',
		imageFile: null,
		imageUrl: '',
		location_size: 42,
		location_border_thickness: 4,
		location_shape: 'rect'
	}
}

export function createLocation(): Location {
	return {
		name: 'New Location',
		chest_unopened_img: '',
		chest_opened_img: '',
		access_rules: [],
		visibility_rules: [],
		sections: [createSection()],
		children: [],
		map_locations: []
	}
}

export function createSection(): PoptrackerSection {
	return {
		id: nanoid(),
		name: 'New Section',
		item_count: 1,
		hosted_item: '',
		access_rules: [],
		visibility_rules: [],
		chest_unopened_img: '',
		chest_opened_img: ''
	}
}

// Global application state persisted to IndexedDB via localForage
class AppState {
	packs = $state<PackConfig[]>([])
	selectedPackId = $state<string | null>(null)
	selectedMapId = $state<string | null>(null)
	#selectedBox = $state<MapLocation | null>(null)
	theme = $state<'light' | 'poptracker'>('poptracker')
	placingMode = $state(false)
	ready = $state(false)

	constructor() {
		this.#load()
		this.#setupPersistence()
	}

	async #load() {
		const [packs, selectedPackId, selectedMapId, selectedBox, theme] = await Promise.all([
			store.getItem<PackConfig[]>('packs'),
			store.getItem<string>('selectedPackId'),
			store.getItem<string>('selectedMapId'),
			store.getItem<MapLocation>('selectedBox'),
			store.getItem<'light' | 'poptracker'>('theme')
		])

		if (packs != null) {
			this.packs = packs
		}
		if (selectedPackId != null) {
			this.selectedPackId = selectedPackId
		}
		if (selectedMapId != null) {
			this.selectedMapId = selectedMapId
		}
		if (selectedBox != null) {
			this.#selectedBox = selectedBox
		}
		if (theme != null) {
			this.theme = theme
		}

		this.ready = true
	}

	#setupPersistence() {
		$effect.root(() => {
			$effect(() => {
				if (!this.ready) {
					return
				}
				store.setItem('packs', $state.snapshot(this.packs))
			})
			$effect(() => {
				if (!this.ready) {
					return
				}
				store.setItem('selectedPackId', this.selectedPackId)
			})
			$effect(() => {
				if (!this.ready) {
					return
				}
				store.setItem('selectedMapId', this.selectedMapId)
			})
			$effect(() => {
				if (!this.ready) {
					return
				}
				store.setItem('selectedBox', $state.snapshot(this.selectedBox))
			})
			$effect(() => {
				if (!this.ready) {
					return
				}
				store.setItem('theme', this.theme)
			})
		})
	}

	get selectedPack() {
		return this.packs.find((p) => p.id === this.selectedPackId) ?? null
	}

	get maps() {
		return this.selectedPack?.maps ?? []
	}

	get selectedMap() {
		return this.maps.find((m) => m.id === this.selectedMapId) ?? null
	}

	get selectedBox() {
		return this.#selectedBox
	}
	set selectedBox(box: MapLocation | null) {
		if (!this.selectedMap) {
			this.#selectedBox = null
			return
		}

		this.#selectedBox = box
	}

	addMap() {
		if (this.packs.length === 0) {
			this.addPack()
		}
		const map = createMap()
		this.maps.push(map)
		this.selectedMapId = map.id
		this.selectedBox = null
	}

	removeMap(id: string) {
		const idx = this.maps.findIndex((m) => m.id === id)
		if (idx >= 0) {
			this.maps.splice(idx, 1)
			if (this.selectedMapId === id) {
				this.selectedMapId = this.maps.length > 0 ? this.maps[0].id : null
				this.selectedBox = null
			}
		}
	}

	selectMap(id: string) {
		this.selectedMapId = id
		this.selectedBox = null
		this.placingMode = false
	}

	addLocationBox(x: number, y: number) {
		const pack = this.selectedPack
		const map = this.selectedMap

		if (!pack || !map) {
			return
		}

		const loc = createLocation()
		const box = {
			map: map.name,
			x,
			y,
			size: 0
		}

		loc.map_locations = [box]
		pack.locations.push(loc)
		this.selectedBox = box
		this.placingMode = false
	}

	removeLocationBox(box: MapLocation) {
		const pack = this.selectedPack
		if (!pack) {
			return
		}

		findAllLocationsContainingMapLocation(pack.locations, box).forEach((loc) => {
			if (!loc.map_locations) {
				console.warn('Reached a path that should be logically impossible')
				return
			}

			const idx = loc.map_locations.findIndex((ml) => areMapLocationsEqual(ml, box))
			if (idx >= 0) {
				loc.map_locations.splice(idx, 1)
			}
		})

		if (this.selectedBox && areMapLocationsEqual(this.selectedBox, box)) {
			this.selectedBox = null
		}
	}

	selectBox(box: NonNullable<Location['map_locations']>[number] | null) {
		this.selectedBox = box
	}

	addPack() {
		const pack = createPack()
		this.packs.push(pack)
		this.selectedPackId = pack.id
		this.selectedMapId = pack.maps[0]?.id ?? null
		this.selectedBox = null
	}

	removePack(id: string) {
		const idx = this.packs.findIndex((p) => p.id === id)

		if (idx < 0) {
			return
		}

		this.packs.splice(idx, 1)
		if (this.selectedPackId === id) {
			this.selectedPackId = this.packs.length > 0 ? this.packs[0].id : null
			this.selectedMapId = this.packs.length > 0 ? (this.packs[0].maps[0]?.id ?? null) : null
			this.selectedBox = null
		}
	}

	selectPack(id: string) {
		if (this.selectedPackId === id) {
			return
		}
		this.selectedPackId = id
		this.selectedMapId = this.packs.find((p) => p.id === id)?.maps[0]?.id ?? null
		this.selectedBox = null
	}

	toggleTheme() {
		this.theme = this.theme === 'poptracker' ? 'light' : 'poptracker'
	}
}

export const appState = new AppState()
