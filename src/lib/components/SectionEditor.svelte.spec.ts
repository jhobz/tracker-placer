import type { PoptrackerSection } from '$lib/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-svelte'
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
		const { getByText } = render(SectionEditor, { sections: [] })

		await expect.element(getByText('No sections. Add one above.')).toBeVisible()
	})

	it('renders a section with its index label', async () => {
		const sections = $state([makeSection()])
		const { getByText } = render(SectionEditor, { sections })

		await expect.element(getByText('Test Section')).toBeVisible()
	})

	it('renders section name input with value', async () => {
		const sections = $state([makeSection({ name: 'My Section' })])
		const { getByPlaceholder } = render(SectionEditor, { sections })

		await expect.element(getByPlaceholder('Section name')).toHaveValue('My Section')
	})

	it('adds a new section when Add button is clicked', async () => {
		const sections: PoptrackerSection[] = $state([makeSection()])
		const { getByRole } = render(SectionEditor, { sections })

		await getByRole('button', { name: 'Add' }).click()

		expect(sections).toHaveLength(2)
	})

	it('removes a section when remove button is clicked', async () => {
		const sections = $state([makeSection()])
		const { getByTitle } = render(SectionEditor, { sections })

		await getByTitle('Remove section').click()

		expect(sections).toHaveLength(0)
	})

	it('renders item_count and hosted_item inputs', async () => {
		const sections = $state([makeSection({ item_count: 3, hosted_item: 'sword' })])
		const { getByPlaceholder } = render(SectionEditor, { sections })

		await expect.element(getByPlaceholder('item_name')).toHaveValue('sword')
	})

	it('renders multiple sections with correct labels', async () => {
		const sections = $state([
			makeSection({ id: 'sec-1', name: 'First' }),
			makeSection({ id: 'sec-2', name: 'Second' })
		])
		const { getByText } = render(SectionEditor, { sections })

		await expect.element(getByText('First')).toBeVisible()
		await expect.element(getByText('Second')).toBeVisible()
	})

	it('renders chest image inputs', async () => {
		const sections = $state([makeSection()])

		const { getByText } = render(SectionEditor, { sections })

		await expect.element(getByText('Chest Unopened Img')).toBeInTheDocument()
		await expect.element(getByText('Chest Opened Img')).toBeInTheDocument()
	})

	it('renders access rules and visibility rules textareas', async () => {
		const sections = $state([makeSection()])

		const { getByText } = render(SectionEditor, { sections })

		await expect.element(getByText('Access Rules')).toBeInTheDocument()
		await expect.element(getByText('Visibility Rules')).toBeInTheDocument()
	})
})
