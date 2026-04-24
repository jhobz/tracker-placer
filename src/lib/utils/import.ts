import type { Location, MapConfig, PoptrackerMapJson } from '$lib/types'
import { parse as parseJsonC, type ParseError } from 'jsonc-parser'
import JSZip from 'jszip'
import { nanoid } from 'nanoid'

/**
 * Extracts the name of a Poptracker pack from a zip file.
 *
 * @param file - The zip file to extract the pack name from
 * @returns Promise resolving to the pack name
 * @throws If the file is not a valid zip, or if the manifest.json is missing or invalid
 */
export async function extractPackNameFromPackFile(file: File): Promise<string> {
	const zip = await getZipFromFile(file)

	const manifestFiles = zip.filter((path) => {
		const isRoot = !path.includes('/')
		const filename = isRoot ? path : path.substring(path.lastIndexOf('/') + 1)

		return filename === 'manifest.json'
	})

	if (!manifestFiles || manifestFiles.length === 0) {
		throw new Error('manifest.json not found in zip file')
	}

	const manifestContent = await convertZipFileToJsonString(manifestFiles[0])

	try {
		const errors: ParseError[] = []
		const manifest = parseJsonC(manifestContent, errors, { allowTrailingComma: true })

		if (errors.length > 0) {
			throw new Error(makeJsonParserErrorMessage('manifest.json', errors))
		}

		return manifest.name
	} catch (err) {
		throw new Error('Invalid JSON in manifest.json', { cause: err })
	}
}

/**
 * Extracts all map JSON objects from a poptracker pack zip file.
 *
 * @param file - The zip file to extract from
 * @returns Promise resolving to an array of MapConfig objects
 * @throws If the file is not a valid zip, or if any map JSON is invalid
 */
export async function extractMapsFromPackFile(file: File): Promise<MapConfig[]> {
	const zip = await getZipFromFile(file)
	const maps: MapConfig[] = []
	const files = zip.filter(
		(f) => f.includes('maps/') && (f.endsWith('.json') || f.endsWith('.jsonc'))
	)

	// Can't use forEach because async
	for (const file of files) {
		const content = await convertZipFileToJsonString(file)

		try {
			const errors: ParseError[] = []
			const parsedMaps: (PoptrackerMapJson & MapConfig)[] = parseJsonC(content, errors, {
				allowTrailingComma: true
			})

			if (errors.length > 0) {
				throw new Error(makeJsonParserErrorMessage(file.name, errors))
			}

			for (const map of parsedMaps) {
				map.id = nanoid()
				map.imageFile = await getImageFileFromZip(zip, map.img)
				maps.push(map)
			}
		} catch (err) {
			throw new Error(`Invalid JSON in maps: ${file.name}`, { cause: err })
		}
	}

	return maps.flat()
}

/**
 * Extracts all location JSON objects from a poptracker pack zip file.
 *
 * @param file - The zip file to extract from
 * @returns Promise resolving to an array of Location objects
 * @throws If the file is not a valid zip, or if any location JSON is invalid
 */
export async function extractLocationsFromPackFile(file: File): Promise<Location[]> {
	const zip = await getZipFromFile(file)

	const locations: Location[] = []
	const files = zip.filter(
		(f) => f.includes('locations/') && (f.endsWith('.json') || f.endsWith('.jsonc'))
	)

	// Can't use forEach because async
	for (const file of files) {
		const content = await convertZipFileToJsonString(file)

		try {
			const errors: ParseError[] = []
			const parsedLocations = parseJsonC(content, errors, { allowTrailingComma: true })

			if (errors.length > 0) {
				throw new Error(makeJsonParserErrorMessage(file.name, errors))
			}

			locations.push(parsedLocations)
		} catch (err) {
			throw new Error(`Invalid JSON in locations: ${file.name}`, { cause: err })
		}
	}
	return locations.flat()
}

/* Helpers */

const getZipFromFile = async (file: File): Promise<JSZip> => {
	try {
		return await JSZip.loadAsync(await file.arrayBuffer())
	} catch (err) {
		throw new Error('Not a valid zip file', { cause: err })
	}
}

const convertZipFileToJsonString = async (zip: JSZip.JSZipObject): Promise<string> =>
	(await zip.async('string')).replace(/^\uFEFF/, '') // Remove BOM if present

const makeJsonParserErrorMessage = (fileName: string, errors: ParseError[]): string =>
	`JSON parsing errors in ${fileName}: ${errors.map((e) => JSON.stringify(e)).join(', ')}`

const getImageFileFromZip = async (zip: JSZip, imgPath: string): Promise<Blob | null> => {
	const imgFile = zip.filter((path) => path.includes(imgPath))[0]
	if (!imgFile) {
		return null
	}

	return await imgFile.async('blob')
}
