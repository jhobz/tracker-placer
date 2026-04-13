// scripts/sync-schemas.ts
// Fetches JSON schemas from poptracker repo and saves them to src/schemas

import fs from 'fs/promises'
import fetch from 'node-fetch'
import path from 'path'

const SCHEMAS = [
	'maps.json',
	'locations.json'
	// Add more schema filenames as needed
]

const POPTRACKER_RAW_BASE =
	'https://raw.githubusercontent.com/black-sliver/PopTracker/refs/heads/master/schema/packs'
const DEST_DIR = path.resolve(__dirname, '../src/schemas')

async function fetchAndSaveSchema(schema: string) {
	const url = `${POPTRACKER_RAW_BASE}/${schema}`
	const dest = path.join(DEST_DIR, schema)
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
	}
	const data = await res.text()
	await fs.writeFile(dest, data)
	console.log(`Fetched and saved: ${schema}`)
}

async function main() {
	await fs.mkdir(DEST_DIR, { recursive: true })
	for (const schema of SCHEMAS) {
		await fetchAndSaveSchema(schema)
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
