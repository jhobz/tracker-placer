// Poptracker Pack Data Types
import type { Location, Maps, Section } from '../types'

export interface PackConfig {
	id: string
	name: string
	maps: MapConfig[]
}

export type MapConfig = Omit<Maps[number], 'img'> & {
	id: string
	imageFile: Blob | null
	imageUrl: string
	locationBoxes: LocationBox[]
}

export interface LocationBox {
	id: string
	x: number // pixel position on image
	y: number
	size: number // square size (overrides map default if set, 0 = use map default)
	locations: PoptrackerLocation[]
}

export type PoptrackerLocation = Location & { id: string }
export type PoptrackerSection = Extract<Section, { chest_unopened_img?: string }> & { id: string }
export type MapLocationRef = NonNullable<Location['map_locations']>[number]

// JSON export types (Poptracker format)
export type PoptrackerMapJson = Maps[number]
export type PoptrackerLocationJson = Location
export type PoptrackerSectionJson = Extract<Section, { chest_unopened_img?: string }>
export type PoptrackerMapLocationJson = MapLocationRef
