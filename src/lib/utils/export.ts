import type {
	MapConfig,
	LocationBox,
	PoptrackerLocation,
	PoptrackerSection,
	PoptrackerMapJson,
	PoptrackerLocationJson,
	PoptrackerSectionJson,
	PoptrackerMapLocationJson
} from '../types.js';

function parseRules(rules: string[]): string[][] {
	return rules
		.map((r) => r.trim())
		.filter((r) => r.length > 0)
		.map((r) => [r]);
}

function exportSection(section: PoptrackerSection): PoptrackerSectionJson {
	const obj: PoptrackerSectionJson = {
		name: section.name
	};
	if (section.item_count !== 1) obj.item_count = section.item_count;
	if (section.hosted_item) obj.hosted_item = section.hosted_item;
	const ar = parseRules(section.access_rules);
	if (ar.length > 0) obj.access_rules = ar;
	const vr = parseRules(section.visibility_rules);
	if (vr.length > 0) obj.visibility_rules = vr;
	if (section.chest_unopened_img) obj.chest_unopened_img = section.chest_unopened_img;
	if (section.chest_opened_img) obj.chest_opened_img = section.chest_opened_img;
	return obj;
}

function exportMapLocationRef(
	box: LocationBox,
	mapName: string
): PoptrackerMapLocationJson {
	const obj: PoptrackerMapLocationJson = {
		map: mapName,
		x: Math.round(box.x),
		y: Math.round(box.y)
	};
	if (box.size > 0) obj.size = box.size;
	if (box.rectWidth > 0) obj.rect_width = box.rectWidth;
	if (box.rectHeight > 0) obj.rect_height = box.rectHeight;
	return obj;
}

function exportLocation(
	location: PoptrackerLocation,
	box: LocationBox,
	mapName: string
): PoptrackerLocationJson {
	const obj: PoptrackerLocationJson = {
		name: location.name
	};
	if (location.chest_unopened_img) obj.chest_unopened_img = location.chest_unopened_img;
	if (location.chest_opened_img) obj.chest_opened_img = location.chest_opened_img;
	if (location.inherit_icon_from) obj.inherit_icon_from = location.inherit_icon_from;

	const ar = parseRules(location.access_rules);
	if (ar.length > 0) obj.access_rules = ar;
	const vr = parseRules(location.visibility_rules);
	if (vr.length > 0) obj.visibility_rules = vr;

	if (location.sections.length > 0) {
		obj.sections = location.sections.map(exportSection);
	}

	if (location.children.length > 0) {
		obj.children = location.children.map((c) => exportLocation(c, box, mapName));
	}

	obj.map_locations = [exportMapLocationRef(box, mapName)];

	return obj;
}

export function exportMapsJson(maps: MapConfig[]): PoptrackerMapJson[] {
	return maps.map((map) => ({
		name: map.name,
		location_size: map.locationSize,
		location_border_thickness: map.locationBorderThickness,
		img: `images/maps/${map.name.toLowerCase().replace(/\s+/g, '_')}.png`
	}));
}

export function exportLocationsJson(maps: MapConfig[]): PoptrackerLocationJson[] {
	const locations: PoptrackerLocationJson[] = [];

	for (const map of maps) {
		for (const box of map.locationBoxes) {
			for (const location of box.locations) {
				locations.push(exportLocation(location, box, map.name));
			}
		}
	}

	return locations;
}

export function downloadJson(filename: string, data: unknown) {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
