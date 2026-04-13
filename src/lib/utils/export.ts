import type {
	LocationBox,
	MapConfig,
	PoptrackerLocation,
	PoptrackerLocationJson,
	PoptrackerMapJson,
	PoptrackerMapLocationJson,
	PoptrackerSection,
	PoptrackerSectionJson
} from '../types'
import { validateLocationsJson, validateMapsJson } from './validate'

export class ExportValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ExportValidationError'
	}
}

function parseRules(rules: string | string[] | string[][]): string | string[] | string[][] {
	if (typeof rules === 'string') {
		return rules.trim()
	} else if (Array.isArray(rules)) {
		if (rules.every((r) => typeof r === 'string')) {
			return (rules as string[]).map((r) => r.trim()).filter((r) => r.length > 0)
		} else {
			return (rules as string[][]).map((arr) =>
				arr.map((r) => r.trim()).filter((r) => r.length > 0)
			)
		}
	}
	return rules
}

function exportSection(section: PoptrackerSection | PoptrackerSectionJson): PoptrackerSectionJson {
	const obj: PoptrackerSectionJson = {
		name: section.name
	}
	if (section.item_count !== 1) {
		obj.item_count = section.item_count
	}
	if (section.hosted_item) {
		obj.hosted_item = section.hosted_item
	}
	if (section.access_rules?.length) {
		obj.access_rules = parseRules(section.access_rules)
	}
	if (section.visibility_rules?.length) {
		obj.visibility_rules = parseRules(section.visibility_rules)
	}
	if (section.chest_unopened_img) {
		obj.chest_unopened_img = section.chest_unopened_img
	}
	if (section.chest_opened_img) {
		obj.chest_opened_img = section.chest_opened_img
	}
	return obj
}

function exportMapLocationRef(box: LocationBox, mapName?: string): PoptrackerMapLocationJson {
	const obj: PoptrackerMapLocationJson = {
		map: mapName,
		x: Math.round(box.x),
		y: Math.round(box.y)
	}
	if (box.size > 0) {
		obj.size = box.size
	}
	return obj
}

function exportLocation(
	location: PoptrackerLocation | PoptrackerLocationJson,
	box: LocationBox,
	mapName?: string
): PoptrackerLocationJson {
	const obj: PoptrackerLocationJson = {
		name: location.name
	}
	if (location.chest_unopened_img) {
		obj.chest_unopened_img = location.chest_unopened_img
	}
	if (location.chest_opened_img) {
		obj.chest_opened_img = location.chest_opened_img
	}

	if (location.access_rules?.length) {
		obj.access_rules = parseRules(location.access_rules)
	}
	if (location.visibility_rules?.length) {
		obj.visibility_rules = parseRules(location.visibility_rules)
	}

	if (location.sections?.length) {
		obj.sections = (location.sections as PoptrackerSectionJson[]).map(exportSection)
	}

	if (location.children?.length) {
		obj.children = location.children.map((c) => exportLocation(c, box, mapName))
	}

	obj.map_locations = [exportMapLocationRef(box, mapName)]

	return obj
}

export function exportMapsJson(
	maps: MapConfig[],
	overrideErrors: boolean = false
): PoptrackerMapJson[] {
	const result = maps.map((map) => {
		return {
			name: map.name as PoptrackerMapJson['name'],
			location_size: map.location_size as PoptrackerMapJson['location_size'],
			location_border_thickness:
				map.location_border_thickness as PoptrackerMapJson['location_border_thickness'],
			location_shape: map.location_shape as PoptrackerMapJson['location_shape'],
			img: `images/maps/${(map.name ?? '').toString().toLowerCase().replace(/\s+/g, '_')}.png`
		} satisfies PoptrackerMapJson
	})

	if (!overrideErrors && !validateMapsJson(result)) {
		throw new ExportValidationError(
			`Validation failed for maps.json: ${
				validateMapsJson.errors?.map((e) => `${e.instancePath} ${e.message}`).join(', ') ??
				'Unknown validation error'
			}`
		)
	}

	return result
}

export function exportLocationsJson(
	maps: MapConfig[],
	overrideErrors: boolean = false
): PoptrackerLocationJson[] {
	const locations: PoptrackerLocationJson[] = []

	for (const map of maps) {
		for (const box of map.locationBoxes) {
			for (const location of box.locations) {
				locations.push(exportLocation(location, box, map.name as PoptrackerMapJson['name']))
			}
		}
	}

	if (!overrideErrors && !validateLocationsJson(locations)) {
		throw new ExportValidationError(
			`Validation failed for locations.json: ${
				validateLocationsJson.errors?.map((e) => `${e.instancePath} ${e.message}`).join(', ') ??
				'Unknown validation error'
			}`
		)
	}

	return locations
}

export function downloadJson(filename: string, data: unknown) {
	const json = JSON.stringify(data, null, 2)
	const blob = new Blob([json], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
