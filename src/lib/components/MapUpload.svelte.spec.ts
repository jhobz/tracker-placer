import { appState } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import MapUpload from './MapUpload.svelte'

describe('MapUpload', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null
		appState.addPack()
	})

	it('renders the drop zone text', async () => {
		const { getByText } = render(MapUpload)

		await expect.element(getByText('Drop map images here or click to upload')).toBeVisible()
	})

	it('renders supported formats text', async () => {
		const { getByText } = render(MapUpload)

		await expect.element(getByText(/PNG, JPG, GIF, WebP supported/)).toBeVisible()
	})

	it('has a hidden file input accepting images', async () => {
		const { container } = render(MapUpload)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		expect(fileInput).not.toBeNull()
		expect(fileInput.accept).toBe('image/*')
		expect(fileInput.multiple).toBe(true)
	})
})
