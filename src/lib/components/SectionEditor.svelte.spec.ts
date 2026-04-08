import type { PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import SectionEditor from './SectionEditor.svelte'

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

describe('SectionEditor', () => {
	beforeEach(() => {
		cleanup()
	})

	it('renders empty state when no sections', async () => {
		render(SectionEditor, { sections: [] })

		await expect.element(page.getByText('No sections. Add one above.')).toBeInTheDocument()
	})

	it('renders a section with its index label', async () => {
		const sections = $state([makeSection()])
		render(SectionEditor, { sections })

		await expect.element(page.getByText('Section 1')).toBeInTheDocument()
	})

	it('renders section name input with value', async () => {
		const sections = $state([makeSection({ name: 'My Section' })])
		render(SectionEditor, { sections })

		await expect.element(page.getByPlaceholder('Section name')).toHaveValue('My Section')
	})

	it('adds a new section when Add button is clicked', async () => {
		const sections: PoptrackerSection[] = $state([makeSection()])
		render(SectionEditor, { sections })

		await page.getByRole('button', { name: 'Add' }).click()

		expect(sections).toHaveLength(2)
	})

	it('removes a section when remove button is clicked', async () => {
		const sections = $state([makeSection()])
		render(SectionEditor, { sections })

		await page.getByRole('button', { name: 'Remove section' }).click()

		expect(sections).toHaveLength(0)
	})

	it('renders item_count and hosted_item inputs', async () => {
		const sections = $state([makeSection({ item_count: 3, hosted_item: 'sword' })])
		render(SectionEditor, { sections })

		await expect.element(page.getByPlaceholder('item_name')).toHaveValue('sword')
	})

	it('renders multiple sections with correct labels', async () => {
		const sections = $state([
			makeSection({ id: 'sec-1', name: 'First' }),
			makeSection({ id: 'sec-2', name: 'Second' })
		])
		render(SectionEditor, { sections })

		await expect.element(page.getByText('Section 1')).toBeInTheDocument()
		await expect.element(page.getByText('Section 2')).toBeInTheDocument()
	})

	it('renders chest image inputs', async () => {
		const sections = $state([makeSection()])
		render(SectionEditor, { sections })

		await expect.element(page.getByText('Chest Unopened Img')).toBeInTheDocument()
		await expect.element(page.getByText('Chest Opened Img')).toBeInTheDocument()
	})

	it('renders access rules and visibility rules textareas', async () => {
		const sections = $state([makeSection()])
		render(SectionEditor, { sections })

		await expect.element(page.getByText('Access Rules')).toBeInTheDocument()
		await expect.element(page.getByText('Visibility Rules')).toBeInTheDocument()
	})
})
