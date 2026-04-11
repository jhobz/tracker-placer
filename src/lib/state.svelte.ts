import localforage from 'localforage'
import { nanoid } from 'nanoid'
import type {
	LocationBox,
	MapConfig,
	PackConfig,
	PoptrackerLocation,
	PoptrackerSection
} from './types'

const store = localforage.createInstance({
	name: 'tracker-placer',
	storeName: 'app_state',
	driver: localforage.INDEXEDDB
})

export function createPack(): PackConfig {
	return {
		id: nanoid(),
		name: 'New Pack',
		maps: []
	}
}

export function createMap(): MapConfig {
	return {
		id: nanoid(),
		name: 'New Map',
		imageFile: null,
		imageUrl: '',
		locationSize: 42,
		locationBorderThickness: 4,
		locationBoxes: []
	}
}

export function createLocationBox(x: number, y: number): LocationBox {
	return {
		id: nanoid(),
		x,
		y,
		size: 0,
		rectWidth: 0,
		rectHeight: 0,
		locations: [createLocation()]
	}
}

export function createLocation(): PoptrackerLocation {
	return {
		id: nanoid(),
		name: 'New Location',
		chest_unopened_img: '',
		chest_opened_img: '',
		inherit_icon_from: '',
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
	selectedBoxId = $state<string | null>(null)
	theme = $state<'light' | 'poptracker'>('poptracker')
	placingMode = $state(false)
	ready = $state(false)

	constructor() {
		this.#load()
		this.#setupPersistence()
	}

	async #load() {
		const [packs, selectedPackId, selectedMapId, selectedBoxId, theme] = await Promise.all([
			store.getItem<PackConfig[]>('packs'),
			store.getItem<string>('selectedPackId'),
			store.getItem<string>('selectedMapId'),
			store.getItem<string>('selectedBoxId'),
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
		if (selectedBoxId != null) {
			this.selectedBoxId = selectedBoxId
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
				store.setItem('selectedBoxId', this.selectedBoxId)
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
		return this.selectedMap?.locationBoxes.find((b) => b.id === this.selectedBoxId) ?? null
	}

	addMap() {
		if (this.packs.length === 0) {
			this.addPack()
		}
		const map = createMap()
		this.maps.push(map)
		this.selectedMapId = map.id
		this.selectedBoxId = null
	}

	removeMap(id: string) {
		const idx = this.maps.findIndex((m) => m.id === id)
		if (idx >= 0) {
			this.maps.splice(idx, 1)
			if (this.selectedMapId === id) {
				this.selectedMapId = this.maps.length > 0 ? this.maps[0].id : null
				this.selectedBoxId = null
			}
		}
	}

	selectMap(id: string) {
		this.selectedMapId = id
		this.selectedBoxId = null
		this.placingMode = false
	}

	addLocationBox(x: number, y: number) {
		const map = this.selectedMap
		if (!map) {
			return
		}
		const box = createLocationBox(x, y)
		map.locationBoxes.push(box)
		this.selectedBoxId = box.id
		this.placingMode = false
	}

	removeLocationBox(mapId: string, boxId: string) {
		const map = this.maps.find((m) => m.id === mapId)

		if (!map) {
			return
		}

		const idx = map.locationBoxes.findIndex((b) => b.id === boxId)

		if (idx < 0) {
			return
		}

		map.locationBoxes.splice(idx, 1)
		if (this.selectedBoxId === boxId) {
			this.selectedBoxId = null
		}
	}

	selectBox(id: string) {
		this.selectedBoxId = id
	}

	addPack() {
		const pack = createPack()
		this.packs.push(pack)
		this.selectedPackId = pack.id
		this.selectedMapId = pack.maps[0]?.id ?? null
		this.selectedBoxId = null
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
			this.selectedBoxId = null
		}
	}

	selectPack(id: string) {
		if (this.selectedPackId === id) {
			return
		}
		this.selectedPackId = id
		this.selectedMapId = this.packs.find((p) => p.id === id)?.maps[0]?.id ?? null
		this.selectedBoxId = null
	}

	toggleTheme() {
		this.theme = this.theme === 'poptracker' ? 'light' : 'poptracker'
	}
}

export const appState = new AppState()
