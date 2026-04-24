import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ImportModal from './ImportModal.svelte'

vi.mock('$lib/utils/import', () => ({
	extractPackNameFromPackFile: vi.fn().mockResolvedValue('Test Pack'),
	extractMapsFromPackFile: vi.fn().mockResolvedValue([{ name: 'Test Map' }]),
	extractLocationsFromPackFile: vi.fn().mockResolvedValue([{ name: 'Test Location' }])
}))

describe('ImportModal', () => {
	it('should not be visible by default', async () => {
		const { getByRole } = render(ImportModal, { open: false, onclose: vi.fn() })

		await expect
			.element(getByRole('dialog', { name: 'Import Poptracker Pack' }))
			.not.toBeInTheDocument()
	})

	it('should be visible when open is true', async () => {
		const { getByRole } = render(ImportModal, { open: true, onclose: vi.fn() })
		await expect.element(getByRole('dialog', { name: 'Import Poptracker Pack' })).toBeVisible()
	})

	it('should call onclose when close button is clicked', async () => {
		const onclose = vi.fn()

		const { getByText } = render(ImportModal, { open: true, onclose })
		await getByText('Close', { exact: true }).click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('should call onclose when ✕ button is clicked', async () => {
		const onclose = vi.fn()

		const { getByLabelText } = render(ImportModal, { open: true, onclose })
		await getByLabelText('Close').click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('should call onclose when backdrop is clicked', async () => {
		const onclose = vi.fn()

		const { getByRole } = render(ImportModal, { props: { open: true, onclose } })
		await getByRole('button', { name: 'close', exact: true }).click()

		expect(onclose).toHaveBeenCalledOnce()
	})

	it('should ignore files that are not zip', async () => {
		const file = new File([''], 'not-a-zip.txt', { type: 'text/plain' })

		const { getByLabelText } = render(ImportModal, { open: true, onclose: vi.fn() })
		await getByLabelText('Upload Poptracker pack ZIP file').upload(file)

		// No error, no maps/locations extracted, UI remains in upload state
		expect(getByLabelText('Upload Poptracker pack ZIP file')).toBeInTheDocument()
	})

	it('should call onupload after file select', async () => {
		const onupload = vi.fn()
		const file = new File([''], 'pack.zip', { type: 'application/zip' })

		const { getByLabelText } = render(ImportModal, { open: true, onclose: vi.fn(), onupload })
		await getByLabelText('Upload Poptracker pack ZIP file').upload(file)

		expect(onupload).toHaveBeenCalledOnce()
	})

	it('should show extracted maps and locations after upload', async () => {
		const file = new File([''], 'pack.zip', { type: 'application/zip' })

		const { getByLabelText, getByText } = render(ImportModal, { open: true, onclose: vi.fn() })
		await getByLabelText('Upload Poptracker pack ZIP file').upload(file)

		await expect.element(getByText('Test Map')).toBeInTheDocument()
		await expect.element(getByText('Test Location')).toBeInTheDocument()
	})

	it('should call confirmImport and update appState when Import is clicked', async () => {
		const { appState } = await import('$lib/state.svelte')
		const addPackSpy = vi.spyOn(appState, 'addPack')
		appState.packs.length = 0
		const file = new File([''], 'pack.zip', { type: 'application/zip' })

		const { getByLabelText, getByRole } = render(ImportModal, { open: true, onclose: vi.fn() })
		await getByLabelText('Upload Poptracker pack ZIP file').upload(file)
		await getByRole('button', { name: 'Import' }).click()

		expect(addPackSpy).toHaveBeenCalled()
		expect(appState.packs.length).toBe(1)
		const pack = appState.packs[0]
		expect(pack?.maps).toEqual([{ name: 'Test Map' }])
		expect(pack?.locations).toEqual([{ name: 'Test Location' }])
		addPackSpy.mockRestore()
	})
})
