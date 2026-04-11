import { appState } from '$lib/state.svelte'
import type { LocationBox, MapConfig, PoptrackerLocation, PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import ExportModal from './ExportModal.svelte'

describe('ExportModal', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.addPack()
	})

	it('does not render content when open is false', async () => {
		const { getByText } = render(ExportModal, { open: false, onclose: () => {} })

		await expect.element(getByText('Export JSON Files')).not.toBeInTheDocument()
	})

	it('renders modal when open is true', async () => {
		const { getByText, getByRole } = render(ExportModal, { open: true, onclose: () => {} })

		await expect.element(getByText('Export JSON Files')).toBeInTheDocument()
		await expect.element(getByRole('button', { name: 'maps.json', exact: true })).toBeVisible()
		await expect.element(getByRole('button', { name: 'locations.json', exact: true })).toBeVisible()
	})

	it('shows maps.json tab by default', async () => {
		appState.maps.push(makeMap({ name: 'Overworld' }))

		const { getByText } = render(ExportModal, { open: true, onclose: () => {} })

		// maps tab should be active and show maps JSON content in the <pre>
		await expect.element(getByText('"Overworld"')).toBeVisible()
	})

	it('switches to locations.json tab on click', async () => {
		appState.maps.push(
			makeMap({
				name: 'Overworld',
				locationBoxes: [makeBox({ locations: [makeLocation({ name: 'Kakariko' })] })]
			})
		)

		const { getByText } = render(ExportModal, { open: true, onclose: () => {} })
		await getByText('locations.json').click()

		// Should show location name in the preview
		await expect.element(getByText('"Kakariko"')).toBeVisible()
	})

	it('shows empty arrays when no maps exist', async () => {
		const { getByText } = render(ExportModal, { open: true, onclose: () => {} })

		// maps.json tab should show empty array
		await expect.element(getByText('[]')).toBeVisible()
	})

	it('calls onclose when close button is clicked', async () => {
		const onclose = vi.fn()

		const { getByText } = render(ExportModal, { open: true, onclose })
		await getByText('Close', { exact: true }).click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('calls onclose when ✕ button is clicked', async () => {
		const onclose = vi.fn()

		const { getByLabelText } = render(ExportModal, { open: true, onclose })
		await getByLabelText('Close').click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('calls downloadJson for current tab when Download button is clicked', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))

		const { getByRole } = render(ExportModal, { open: true, onclose: () => {} })
		// Default tab is maps, click the single-file download button
		await getByRole('button', { name: /Download maps\.json/ }).click()

		expect(createObjectURLSpy).toHaveBeenCalledOnce()
		expect(revokeObjectURLSpy).toHaveBeenCalledOnce()

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('calls downloadJson for locations tab when switched', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))

		const { getByRole } = render(ExportModal, { open: true, onclose: () => {} })
		await getByRole('button', { name: 'locations.json', exact: true }).click()
		await getByRole('button', { name: /Download locations\.json/ }).click()

		expect(createObjectURLSpy).toHaveBeenCalledOnce()
		expect(revokeObjectURLSpy).toHaveBeenCalledOnce()

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('calls downloadJson twice when Download All is clicked', async () => {
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
		appState.maps.push(makeMap({ name: 'Overworld' }))

		const { getByRole } = render(ExportModal, { open: true, onclose: () => {} })
		await getByRole('button', { name: /Download All/ }).click()

		// downloadAll calls downloadMaps + downloadLocations, each creating a blob
		expect(createObjectURLSpy).toHaveBeenCalledTimes(2)
		expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2)

		createObjectURLSpy.mockRestore()
		revokeObjectURLSpy.mockRestore()
	})

	it('displays description text about Poptracker pack', async () => {
		const { getByText } = render(ExportModal, { open: true, onclose: () => {} })

		await expect.element(getByText(/Download the generated JSON files/)).toBeVisible()
	})
})

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
