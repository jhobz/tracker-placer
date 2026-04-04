import { nanoid } from 'nanoid'
import type {
	PackConfig,
	MapConfig,
	LocationBox,
	PoptrackerLocation,
	PoptrackerSection
} from './types'

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
		locationSize: 16,
		locationBorderThickness: 1,
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

// Global application state using Svelte 5 runes
class AppState {
	packs = $state<PackConfig[]>([])
	selectedPackId = $state<string | null>(null)
	selectedMapId = $state<string | null>(null)
	selectedBoxId = $state<string | null>(null)
	theme = $state<'light' | 'dark'>('dark')
	placingMode = $state(false) // whether we're in "place location box" mode

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
		this.theme = this.theme === 'dark' ? 'light' : 'dark'
	}
}

export const appState = new AppState()
