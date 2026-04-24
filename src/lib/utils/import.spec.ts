import JSZip from 'jszip'
import { describe, expect, it, vi } from 'vitest'
import {
	extractLocationsFromPackFile,
	extractMapsFromPackFile,
	extractPackNameFromPackFile
} from './import'

vi.mock('nanoid', () => ({
	nanoid: () => 'test-id'
}))

describe('extractPackNameFromPackFile', () => {
	it('should throw an error if the file is not a zip', async () => {
		const file = new File(['notazip'], 'notazip.txt', { type: 'text/plain' })

		const result = extractPackNameFromPackFile(file)

		await expect(result).rejects.toThrow('Not a valid zip file')
	})

	it('should throw if manifest.json is missing', async () => {
		const zip = new JSZip()
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = extractPackNameFromPackFile(file)

		await expect(result).rejects.toThrow('manifest.json not found in zip file')
	})

	it('should throw if manifest.json is invalid JSON', async () => {
		const zip = new JSZip()
		zip.file('manifest.json', '{not valid json}')
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = extractPackNameFromPackFile(file)

		await expect(result).rejects.toThrow('Invalid JSON in manifest.json')
	})

	it('should return the name from manifest.json if present and valid', async () => {
		const zip = new JSZip()
		zip.file('manifest.json', JSON.stringify({ name: 'Test Pack' }))
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractPackNameFromPackFile(file)

		expect(result).toBe('Test Pack')
	})

	it('should handle manifest.json with BOM', async () => {
		const zip = new JSZip()
		zip.file('manifest.json', '\uFEFF' + JSON.stringify({ name: 'Test Pack' }))
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractPackNameFromPackFile(file)

		expect(result).toBe('Test Pack')
	})
})

describe('extractMapsFromPackFile', () => {
	it('should throw an error if the file is not a zip', async () => {
		const file = new File(['notazip'], 'notazip.txt', { type: 'text/plain' })

		const result = extractMapsFromPackFile(file)

		await expect(result).rejects.toThrow()
	})

	it('should return an empty array if the zip does not contain any maps', async () => {
		const zip = new JSZip()
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractMapsFromPackFile(file)

		expect(result).toEqual([])
	})

	it('should extract maps from a valid pack file', async () => {
		const zip = new JSZip()
		zip.file('maps/maps.json', JSON.stringify([{ name: 'Test Map' }]))
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractMapsFromPackFile(file)

		expect(result).toEqual([{ id: 'test-id', name: 'Test Map', imageFile: null }])
	})

	it('should find images within map files and convert them to Blobs', async () => {
		const zip = new JSZip()
		const blob = createTestBlob()
		zip.file(
			'images/test.png',
			await new File([blob], 'test.png', { type: 'image/png' }).arrayBuffer()
		)
		zip.file('maps/maps.json', JSON.stringify([{ name: 'Test Map', img: 'images/test.png' }]))
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractMapsFromPackFile(file)

		expect(result).toEqual([
			{ id: 'test-id', name: 'Test Map', img: 'images/test.png', imageFile: blob }
		])
	})

	it('should ignore non-json files in maps folder', async () => {
		const zip = new JSZip()
		zip.file('maps/readme.txt', 'not json')
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractMapsFromPackFile(file)

		expect(result).toEqual([])
	})

	it('should throw if a map JSON is invalid', async () => {
		const zip = new JSZip()
		zip.file('maps/bad.json', '{not valid json}')
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = extractMapsFromPackFile(file)

		await expect(result).rejects.toThrow()
	})

	it('should handle map JSON with BOM', async () => {
		const zip = new JSZip()
		zip.file('maps/maps.json', '\uFEFF' + JSON.stringify([{ name: 'Test Map' }]))
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractMapsFromPackFile(file)

		expect(result).toEqual([{ id: 'test-id', name: 'Test Map', imageFile: null }])
	})
})

describe('extractLocationsFromPackFile', () => {
	it('should throw an error if the file is not a zip', async () => {
		const file = new File(['notazip'], 'notazip.txt', { type: 'text/plain' })

		const result = extractLocationsFromPackFile(file)

		await expect(result).rejects.toThrow()
	})

	it('should return an empty array if the zip does not contain any locations', async () => {
		const zip = new JSZip()
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractLocationsFromPackFile(file)

		expect(result).toEqual([])
	})

	it('should extract locations from a valid pack file', async () => {
		const zip = new JSZip()
		zip.file(
			'locations/loc1.json',
			JSON.stringify([{ name: 'Test Location', map_locations: [{ name: 'map', x: 0, y: 10 }] }])
		)
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractLocationsFromPackFile(file)

		expect(result).toEqual([
			{ name: 'Test Location', map_locations: [{ name: 'map', x: 0, y: 10 }] }
		])
	})

	it('should ignore non-json files in locations folder', async () => {
		const zip = new JSZip()
		zip.file('locations/readme.txt', 'not json')
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractLocationsFromPackFile(file)

		expect(result).toEqual([])
	})

	it('should throw if a location JSON is invalid', async () => {
		const zip = new JSZip()
		zip.file('locations/bad.json', '{not valid json}')
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = extractLocationsFromPackFile(file)

		await expect(result).rejects.toThrow()
	})

	it('should handle location JSON with BOM', async () => {
		const zip = new JSZip()
		zip.file(
			'locations/locs1.json',
			'\uFEFF' +
				JSON.stringify([{ name: 'Test Location', map_locations: [{ name: 'map', x: 0, y: 10 }] }])
		)
		const uint8 = await zip.generateAsync({ type: 'uint8array' })
		const file = new File([uint8.slice().buffer], 'pack.zip', { type: 'application/zip' })

		const result = await extractLocationsFromPackFile(file)

		expect(result).toEqual([
			{ name: 'Test Location', map_locations: [{ name: 'map', x: 0, y: 10 }] }
		])
	})
})

/** Creates a 1px by 1px transparent PNG blob for testing */
function createTestBlob(): Blob {
	return new Blob([
		Uint8Array.from(
			atob(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
			),
			(c) => c.charCodeAt(0)
		)
	])
}
