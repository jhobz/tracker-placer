import type { Location, MapLocation } from '$lib/types'

/**
 * Recursively (depth-first) searches through the given locations and their children to find all map location references that match the given map name.
 * @param locations The array of locations to search through.
 * @param mapName The name of the map to match.
 * @returns An array of map location references that match the given map name.
 */
export const findAllMapLocationsForMap = (
	locations: Location[],
	mapName: string
): NonNullable<Location['map_locations']> => {
	let matches: NonNullable<Location['map_locations']> = []

	locations.forEach((loc) => {
		const mapLocations = loc.map_locations?.filter((ml) => ml.map === mapName)
		if (mapLocations && mapLocations.length > 0) {
			matches.push(...mapLocations)
		}

		if (loc.children) {
			matches = [...matches, ...findAllMapLocationsForMap(loc.children, mapName)]
		}
	})

	return matches
}

/**
 * Recursively (depth-first) searches through the given locations and their children to find all locations that contain the given map location.
 * @param locations The array of locations to search through.
 * @param mapLocation The map location reference to match.
 * @returns An array of locations that contain the given map location reference.
 */
export const findAllLocationsContainingMapLocation = (
	locations: Location[],
	mapLocation: NonNullable<Location['map_locations']>[number]
): Location[] => {
	let matches: Location[] = []

	locations.forEach((loc) => {
		const containsMapLocation = loc.map_locations?.some((ml) =>
			areMapLocationsEqual(ml, mapLocation)
		)
		if (containsMapLocation) {
			matches.push(loc)
		}

		if (loc.children) {
			matches = [...matches, ...findAllLocationsContainingMapLocation(loc.children, mapLocation)]
		}
	})

	return matches
}

/**
 * Recursively (depth-first) searches through the given locations and their children to find a location with the given name.
 * @param locations The array of locations to search through.
 * @param name The name of the location to find.
 * @returns The location with the given name, or `null` if not found.
 */
export const findLocationByName = (locations: Location[], name: string): Location | null => {
	if (!locations || locations.length === 0) {
		return null
	}

	for (const loc of locations) {
		if (loc.name === name) {
			return loc
		}

		if (loc.children) {
			const found = findLocationByName(loc.children, name)
			if (found) {
				return found
			}
		}
	}

	return null
}

/**
 * Recursively (depth-first) searches through the given locations and their children to find a location by reference.
 * @param locations The array of locations to search through.
 * @param location The location reference to find.
 * @returns A tuple containing the location with the given reference (or `null` if not found) and the path to that location as a string (empty if not found).
 */
export const findLocation = (
	locations: Location[],
	location: Location | null,
	path: string = ''
): [Location | null, string] => {
	if (!locations || locations.length === 0 || !location) {
		return [null, '']
	}

	for (const loc of locations) {
		if (loc === location) {
			return [loc, `${path}/${loc.name}`]
		}

		if (loc.children) {
			const found = findLocation(loc.children, location, `${path}/${loc.name}`)
			if (found[0]) {
				return found
			}
		}
	}

	return [null, '']
}

/**
 * Compares two map location objects for equality by checking that all keys and their corresponding values
 * are present and equal in both objects. The comparison is shallow for each key-value pair, but ensures that
 * both objects have exactly the same keys and values.
 *
 * @param ml1 - The first map location object to compare.
 * @param ml2 - The second map location object to compare.
 * @returns `true` if both map location objects have the same keys and values; otherwise, `false`.
 */
export const areMapLocationsEqual = (ml1: MapLocation | null, ml2: MapLocation | null): boolean => {
	if (ml1 === null || ml2 === null) {
		return ml1 === ml2
	}

	const allFirstKeysMatch = Object.keys(ml1).every((key) => {
		if (key === 'restrict_visibility_rules' || key === 'force_invisibility_rules') {
			return areRulesEqual(ml1[key], ml2[key])
		}

		return (
			Object.hasOwn(ml1, key) &&
			Object.hasOwn(ml2, key) &&
			ml1[key as keyof typeof ml1] === ml2[key as keyof typeof ml2]
		)
	})
	const allSecondKeysMatch = Object.keys(ml2).every((key) => {
		if (key === 'restrict_visibility_rules' || key === 'force_invisibility_rules') {
			return areRulesEqual(ml1[key], ml2[key])
		}

		return (
			Object.hasOwn(ml1, key) &&
			Object.hasOwn(ml2, key) &&
			ml1[key as keyof typeof ml1] === ml2[key as keyof typeof ml2]
		)
	})
	return allFirstKeysMatch && allSecondKeysMatch
}

/**
 * Compares two sets of rules for equality. The rules can be strings, arrays of strings, or arrays of arrays of strings.
 * @param rules1 - The first set of rules to compare.
 * @param rules2 - The second set of rules to compare.
 * @returns `true` if the rules are equal; otherwise, `false`.
 */
const areRulesEqual = (
	rules1: ((string[] | string[][]) & unknown[]) | string | undefined,
	rules2: ((string[] | string[][]) & unknown[]) | string | undefined
): boolean => {
	if (
		(typeof rules1 === 'string' && typeof rules2 === 'string') ||
		(typeof rules1 === 'undefined' && typeof rules2 === 'undefined')
	) {
		return rules1 === rules2
	}

	if (Array.isArray(rules1) && Array.isArray(rules2)) {
		if (rules1.length !== rules2.length) {
			return false
		}
		const sortedRules1 = [...rules1].sort()
		const sortedRules2 = [...rules2].sort()
		for (let i = 0; i < sortedRules1.length; i++) {
			if (!areRulesEqual(sortedRules1[i], sortedRules2[i])) {
				return false
			}
		}
		return true
	}
	return false
}
