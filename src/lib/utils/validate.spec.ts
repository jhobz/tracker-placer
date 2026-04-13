import { describe, expect, it } from 'vitest'
import { validateLocationsJson, validateMapsJson } from './validate'

// Example valid and invalid data (should be replaced with real cases)
const validMaps = [
	{
		name: 'Overworld',
		location_size: 16,
		location_border_thickness: 1,
		img: 'images/maps/overworld.png'
	}
]

const invalidMaps = [
	{
		name: 123, // invalid type
		location_size: 'big', // invalid type
		img: 42 // invalid type
	}
]

const validLocations = [
	{
		name: 'Chest Room',
		map_locations: [{ map: 'Overworld', x: 100, y: 200 }]
	}
]

const invalidLocations = [
	{
		map_locations: 'not-an-array' // wrong type
	}
]

describe('validateMapsJson', () => {
	it('returns true for valid maps', () => {
		expect(validateMapsJson(validMaps)).toBe(true)
	})

	it('returns false for invalid maps', () => {
		expect(validateMapsJson(invalidMaps)).toBe(false)
	})
})

describe('validateLocationsJson', () => {
	it('returns true for valid locations', () => {
		expect(validateLocationsJson(validLocations)).toBe(true)
	})

	it('returns false for invalid locations', () => {
		expect(validateLocationsJson(invalidLocations)).toBe(false)
	})
})
