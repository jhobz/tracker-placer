import { page } from 'vitest/browser'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import ExportModal from './ExportModal.svelte'
import { appState } from '$lib/state.svelte'
import type { MapConfig, LocationBox, PoptrackerLocation, PoptrackerSection } from '$lib/types'

function makeSection(overrides: Partial<PoptrackerSection> = {}): PoptrackerSection {
	return {
		id: 'sec-1',
		name: 'Test Section',
		item_count: 1,
		hosted_item: '',
		access_rules: [],
		visibility_rules: [],
		chest_unopened_img: '',
		chest_opened_img: '',
		...overrides
	}
}

function makeLocation(overrides: Partial<PoptrackerLocation> = {}): PoptrackerLocation {
	return {
		id: 'loc-1',
		name: 'Test Location',
		chest_unopened_img: '',
		chest_opened_img: '',
		inherit_icon_from: '',
		access_rules: [],
		visibility_rules: [],
		sections: [makeSection()],
		children: [],
		map_locations: [],
		...overrides
	}
}

function makeBox(overrides: Partial<LocationBox> = {}): LocationBox {
	return {
		id: 'box-1',
		x: 100,
		y: 200,
		size: 0,
		rectWidth: 0,
		rectHeight: 0,
		locations: [makeLocation()],
		...overrides
	}
}

function makeMap(overrides: Partial<MapConfig> = {}): MapConfig {
	return {
		id: 'map-1',
		name: 'Overworld',
		imageFile: null,
		imageUrl: '',
		locationSize: 16,
		locationBorderThickness: 1,
		locationBoxes: [makeBox()],
		...overrides
	}
}

describe('ExportModal', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.addPack()
	})

	it('does not render content when open is false', async () => {
		render(ExportModal, { open: false, onclose: () => {} })

		await expect.element(page.getByText('Export JSON Files')).not.toBeInTheDocument()
	})

	it('renders modal when open is true', async () => {
		render(ExportModal, { open: true, onclose: () => {} })

		await expect.element(page.getByText('Export JSON Files')).toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'maps.json', exact: true }))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'locations.json', exact: true }))
			.toBeInTheDocument()
	})

	it('shows maps.json tab by default', async () => {
		appState.maps.push(makeMap({ name: 'Overworld' }))
		render(ExportModal, { open: true, onclose: () => {} })

		// maps tab should be active and show maps JSON content in the <pre>
		await expect.element(page.getByText('"Overworld"')).toBeInTheDocument()
	})

	it('switches to locations.json tab on click', async () => {
		appState.maps.push(
			makeMap({
				name: 'Overworld',
				locationBoxes: [makeBox({ locations: [makeLocation({ name: 'Kakariko' })] })]
			})
		)
		render(ExportModal, { open: true, onclose: () => {} })

		// Click locations tab
		await page.getByText('locations.json').click()

		// Should show location name in the preview
		await expect.element(page.getByText('"Kakariko"')).toBeInTheDocument()
	})

	it('shows empty arrays when no maps exist', async () => {
		render(ExportModal, { open: true, onclose: () => {} })

		// maps.json tab should show empty array
		await expect.element(page.getByText('[]')).toBeInTheDocument()
	})

	it('calls onclose when close button is clicked', async () => {
		const onclose = vi.fn()
		render(ExportModal, { open: true, onclose })

		await page.getByText('Close').click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('calls onclose when ✕ button is clicked', async () => {
		const onclose = vi.fn()
		render(ExportModal, { open: true, onclose })

		await page.getByText('✕').click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('calls downloadJson for current tab when Download button is clicked', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))
		render(ExportModal, { open: true, onclose: () => {} })

		// Default tab is maps, click the single-file download button
		await page.getByRole('button', { name: /Download maps\.json/ }).click()

		expect(createObjectURLSpy).toHaveBeenCalledOnce()
		expect(revokeObjectURLSpy).toHaveBeenCalledOnce()

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('calls downloadJson for locations tab when switched', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))
		render(ExportModal, { open: true, onclose: () => {} })

		// Switch to locations tab
		await page.getByRole('button', { name: 'locations.json', exact: true }).click()

		await page.getByRole('button', { name: /Download locations\.json/ }).click()

		expect(createObjectURLSpy).toHaveBeenCalledOnce()
		expect(revokeObjectURLSpy).toHaveBeenCalledOnce()

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('calls downloadJson twice when Download All is clicked', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))
		render(ExportModal, { open: true, onclose: () => {} })

		await page.getByRole('button', { name: /Download All/ }).click()

		// downloadAll calls downloadMaps + downloadLocations, each creating a blob
		expect(createObjectURLSpy).toHaveBeenCalledTimes(2)
		expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2)

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('displays description text about Poptracker pack', async () => {
		render(ExportModal, { open: true, onclose: () => {} })

		await expect.element(page.getByText(/Download the generated JSON files/)).toBeInTheDocument()
	})
})
