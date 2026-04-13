// Skeleton for validation utility
// To be implemented after writing tests (TDD)

import type { PoptrackerLocationJson, PoptrackerMapJson } from '$lib/types'
import Ajv from 'ajv/dist/2020'
import type { SomeJSONSchema } from 'ajv/dist/types/json-schema'

const mapsSchema = await loadSchema('https://poptracker.github.io/schema/packs/strict/maps.json')
const locationsSchema = await loadSchema(
	'https://poptracker.github.io/schema/packs/strict/locations.json'
)

const ajv = new Ajv({
	allErrors: true,
	loadSchema
})
ajv.addKeyword('example')
export const validateMapsJson = await ajv.compileAsync<PoptrackerMapJson[]>(mapsSchema)
export const validateLocationsJson =
	await ajv.compileAsync<PoptrackerLocationJson[]>(locationsSchema)

async function loadSchema(uri: string): Promise<SomeJSONSchema> {
	return await (await fetch(uri)).json()
}
