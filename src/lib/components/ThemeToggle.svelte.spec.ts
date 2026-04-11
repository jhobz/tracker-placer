import { appState } from '$lib/state.svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ThemeToggle from './ThemeToggle.svelte'

describe('ThemeToggle', () => {
	it('renders toggle button', async () => {
		const { getByRole } = render(ThemeToggle)

		await expect.element(getByRole('button', { name: 'Toggle theme' })).toBeVisible()
	})

	it('toggles theme on click', async () => {
		const { getByRole } = render(ThemeToggle)

		const button = getByRole('button', { name: 'Toggle theme' })
		expect(appState.theme).toBe('poptracker')
		await button.click()
		expect(appState.theme).toBe('light')
		await button.click()
		expect(appState.theme).toBe('poptracker')
	})
})
