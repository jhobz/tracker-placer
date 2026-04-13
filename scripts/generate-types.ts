// scripts/generate-types.ts
// Generates TypeScript types from JSON schemas using json-schema-to-typescript

import fs from 'fs/promises'
import { compile } from 'json-schema-to-typescript'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SCHEMAS = [
	'maps.json',
	'locations.json'
	// Add more schema filenames as needed
]

const SCHEMA_BASE = 'https://poptracker.github.io/schema/packs'
const OUT_DIR = path.resolve(__dirname, '../src/types/generated')

async function generateTypes(schema: string) {
	const schemaPath = `${SCHEMA_BASE}/strict/${schema}`
	const schemaContent = await (await fetch(schemaPath)).json()
	if (schemaContent.$id === 'https://poptracker.github.io/schema/packs/strict/maps.json') {
		schemaContent.allOf[0].$ref = `${SCHEMA_BASE}/${schema}`
	}
	const typeName = schema.replace('.json', '')
	const ts = await compile(schemaContent, typeName)
	const outPath = path.join(OUT_DIR, `${typeName}.d.ts`)
	await fs.writeFile(outPath, ts)
	console.log(`Generated types: ${typeName}`)
}

async function main() {
	await fs.mkdir(OUT_DIR, { recursive: true })
	for (const schema of SCHEMAS) {
		await generateTypes(schema)
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
