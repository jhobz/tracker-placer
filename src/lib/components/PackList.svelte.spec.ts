import { page, userEvent } from 'vitest/browser'
import { describe, expect, it, beforeEach } from 'vitest'
import { render, cleanup } from 'vitest-browser-svelte'
import PackList from './PackList.svelte'
import { appState, createPack } from '$lib/state.svelte'

describe('PackList', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBoxId = null
	})

	it('shows empty state when no packs exist', async () => {
		render(PackList)

		await expect.element(page.getByText('Packs', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('No packs yet')).toBeInTheDocument()
	})

	it('renders pack names in the list', async () => {
		const pack1 = createPack()
		pack1.name = 'ALttP'
		const pack2 = createPack()
		pack2.name = 'SM'
		appState.packs.push(pack1, pack2)
		appState.selectedPackId = pack1.id

		render(PackList)

		await expect.element(page.getByText('ALttP')).toBeInTheDocument()
		await expect.element(page.getByText('SM')).toBeInTheDocument()
	})

	it('selects a pack when clicked', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)

		render(PackList)

		await page.getByText('ALttP').click()

		expect(appState.selectedPackId).toBe(pack.id)
	})

	it('adds a pack when add button is clicked', async () => {
		render(PackList)

		await page.getByRole('button', { name: 'Add pack' }).click()

		expect(appState.packs).toHaveLength(1)
	})

	it('removes a pack when remove button is clicked', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		render(PackList)

		await page.getByRole('button', { name: 'Remove pack' }).click()

		expect(appState.packs).toHaveLength(0)
	})

	it('highlights the selected pack', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		render(PackList)

		const packButton = page.getByText('ALttP')
		await expect.element(packButton.element().closest('div')!).toHaveClass(/bg-primary/)
	})

	it('shows an input field on double-click to rename a pack', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		render(PackList)

		await userEvent.dblClick(page.getByText('ALttP').element())

		await expect.element(page.getByRole('textbox')).toBeInTheDocument()
		await expect.element(page.getByRole('textbox')).toHaveValue('ALttP')
	})

	it('updates the pack name when Enter is pressed in rename input', async () => {
		appState.addPack()
		appState.packs[0].name = 'ALttP'

		render(PackList)

		await userEvent.dblClick(page.getByText('ALttP').element())
		await page.getByRole('textbox').fill('Renamed Pack')
		await userEvent.keyboard('{Enter}')

		expect(appState.packs[0].name).toBe('Renamed Pack')
		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument()
	})

	it('commits rename on blur', async () => {
		appState.addPack()
		appState.packs[0].name = 'ALttP'

		render(PackList)

		await userEvent.dblClick(page.getByText('ALttP').element())
		await page.getByRole('textbox').fill('Blurred Pack')
		await userEvent.tab()

		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument()
		expect(appState.packs[0].name).toBe('Blurred Pack')
	})

	it('focuses and selects input when a new pack is added', async () => {
		render(PackList)

		await page.getByRole('button', { name: 'Add pack' }).click()

		const input = page.getByRole('textbox')
		await expect.element(input).toBeInTheDocument()
		expect(document.activeElement).toBe(input.element())
	})
})
