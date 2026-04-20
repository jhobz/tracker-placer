import { appState, createPack } from '$lib/state.svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { userEvent } from 'vitest/browser'
import PackList from './PackList.svelte'

describe('PackList', () => {
	beforeEach(() => {
		cleanup()
		appState.packs.length = 0
		appState.selectedPackId = null
		appState.selectedMapId = null
		appState.selectedBox = null
	})

	it('shows empty state when no packs exist', async () => {
		const { getByText } = render(PackList)

		await expect.element(getByText('Packs', { exact: true })).toBeVisible()
		await expect.element(getByText('No packs yet')).toBeVisible()
	})

	it('renders pack names in the list', async () => {
		const pack1 = createPack()
		pack1.name = 'ALttP'
		const pack2 = createPack()
		pack2.name = 'SM'
		appState.packs.push(pack1, pack2)
		appState.selectedPackId = pack1.id

		const { getByText } = render(PackList)

		await expect.element(getByText('ALttP')).toBeVisible()
		await expect.element(getByText('SM')).toBeVisible()
	})

	it('selects a pack when clicked', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)

		const { getByText } = render(PackList)
		await getByText('ALttP').click()

		expect(appState.selectedPackId).toBe(pack.id)
	})

	it('adds a pack when add button is clicked', async () => {
		const { getByRole } = render(PackList)
		await getByRole('button', { name: 'Add pack' }).click()

		expect(appState.packs).toHaveLength(1)
	})

	it('removes a pack when remove button is clicked', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		const { getByRole } = render(PackList)
		await getByRole('button', { name: 'Remove pack' }).click()

		expect(appState.packs).toHaveLength(0)
	})

	it('highlights the selected pack', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		const { getByRole, getByText } = render(PackList)

		const option = getByRole('option', { has: getByText('ALttP') })
		await expect.element(option).toHaveAttribute('aria-selected', 'true')
		await expect.element(option.element().querySelector('a')).toHaveClass('menu-active')
	})

	it('shows an input field on double-click to rename a pack', async () => {
		const pack = createPack()
		pack.name = 'ALttP'
		appState.packs.push(pack)
		appState.selectedPackId = pack.id

		const { getByText, getByRole } = render(PackList)
		await userEvent.dblClick(getByText('ALttP').element())

		await expect.element(getByRole('textbox')).toBeVisible()
		await expect.element(getByRole('textbox')).toHaveValue('ALttP')
	})

	it('updates the pack name when Enter is pressed in rename input', async () => {
		appState.addPack()
		appState.packs[0].name = 'ALttP'

		const { getByText, getByRole } = render(PackList)
		await userEvent.dblClick(getByText('ALttP').element())
		await getByRole('textbox').fill('Renamed Pack')
		await userEvent.keyboard('{Enter}')

		expect(appState.packs[0].name).toBe('Renamed Pack')
		await expect.element(getByRole('textbox')).not.toBeInTheDocument()
	})

	it('commits rename on blur', async () => {
		appState.addPack()
		appState.packs[0].name = 'ALttP'

		const { getByText, getByRole } = render(PackList)
		await userEvent.dblClick(getByText('ALttP').element())
		await getByRole('textbox').fill('Blurred Pack')
		await userEvent.tab()

		await expect.element(getByRole('textbox')).not.toBeInTheDocument()
		expect(appState.packs[0].name).toBe('Blurred Pack')
	})

	it('focuses and selects input when a new pack is added', async () => {
		const { getByTitle, getByRole } = render(PackList)

		await getByTitle('Add pack').click()

		const input = getByRole('textbox')
		await expect.element(input).toBeVisible()
		expect(document.activeElement).toBe(input.element())
	})
})
