// Poptracker Pack Data Types
import type { Location, Maps, Section } from '../types'

export * from '../types'

export interface PackConfig {
	id: string
	name: string
	maps: MapConfig[]
	locations: Location[]
}

export type MapConfig = Omit<Maps[number], 'img'> & {
	id: string
	imageFile: Blob | null
	imageUrl: string
}

export type PoptrackerSection = Extract<Section, { chest_unopened_img?: string }> & { id: string }
export type MapLocation = NonNullable<Location['map_locations']>[number]

// JSON export types (Poptracker format)
export type PoptrackerMapJson = Maps[number]
export type PoptrackerLocationJson = Location
export type PoptrackerSectionJson = Extract<Section, { chest_unopened_img?: string }>
export type PoptrackerMapLocationJson = MapLocation
