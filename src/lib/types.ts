// Poptracker Pack Data Types

export interface MapConfig {
	id: string
	name: string
	imageFile: File | null
	imageUrl: string
	locationSize: number
	locationBorderThickness: number
	locationBoxes: LocationBox[]
}

export interface LocationBox {
	id: string
	x: number // pixel position on image
	y: number
	size: number // square size (overrides map default if set, 0 = use map default)
	rectWidth: number // 0 = use size
	rectHeight: number // 0 = use size
	locations: PoptrackerLocation[]
}

export interface PoptrackerLocation {
	id: string
	name: string
	chest_unopened_img: string
	chest_opened_img: string
	inherit_icon_from: string
	access_rules: string[]
	visibility_rules: string[]
	sections: PoptrackerSection[]
	children: PoptrackerLocation[]
	map_locations: MapLocationRef[]
}

export interface PoptrackerSection {
	id: string
	name: string
	item_count: number
	hosted_item: string
	access_rules: string[]
	visibility_rules: string[]
	chest_unopened_img: string
	chest_opened_img: string
}

export interface MapLocationRef {
	map: string // map name
	x: number
	y: number
	size: number // 0 = inherit from parent map_location or map
	border_thickness: number // 0 = inherit
	rect_width: number // 0 = use size
	rect_height: number // 0 = use size
}

// JSON export types (Poptracker format)
export interface PoptrackerMapJson {
	name: string
	location_size: number
	location_border_thickness: number
	img: string
}

export interface PoptrackerLocationJson {
	name: string
	chest_unopened_img?: string
	chest_opened_img?: string
	inherit_icon_from?: string
	access_rules?: string[][]
	visibility_rules?: string[][]
	sections?: PoptrackerSectionJson[]
	children?: PoptrackerLocationJson[]
	map_locations?: PoptrackerMapLocationJson[]
}

export interface PoptrackerSectionJson {
	name: string
	item_count?: number
	hosted_item?: string
	access_rules?: string[][]
	visibility_rules?: string[][]
	chest_unopened_img?: string
	chest_opened_img?: string
}

export interface PoptrackerMapLocationJson {
	map: string
	x: number
	y: number
	size?: number
	border_thickness?: number
	rect_width?: number
	rect_height?: number
}
