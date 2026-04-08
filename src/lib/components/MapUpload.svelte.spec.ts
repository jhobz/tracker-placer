import { appState } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import MapUpload from './MapUpload.svelte'

describe('MapUpload', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
		appState.addPack()
	})

	it('renders the drop zone text', async () => {
		render(MapUpload)

		await expect
			.element(page.getByText('Drop map images here or click to upload'))
			.toBeInTheDocument()
	})

	it('renders supported formats text', async () => {
		render(MapUpload)

		await expect.element(page.getByText(/PNG, JPG, GIF, WebP supported/)).toBeInTheDocument()
	})

	it('has a hidden file input accepting images', async () => {
		render(MapUpload)

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
		expect(fileInput).not.toBeNull()
		expect(fileInput.accept).toBe('image/*')
		expect(fileInput.multiple).toBe(true)
	})
})
