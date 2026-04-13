import { createRawSnippet } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import MaterialSymbol from './MaterialSymbol.svelte'

describe('MaterialSymbol', () => {
	it('renders children as icon name', async () => {
		const { container } = render(MaterialSymbol, {
			children: makeChild('map')
		})
		expect(container.textContent).toContain('map')
	})

	it('applies emphasis and deemphasis classes', async () => {
		const { container: emph } = render(MaterialSymbol, {
			children: makeChild('map'),
			emphasis: true
		})
		expect(emph.querySelector('.material-symbols-emphasis')).toBeTruthy()
		const { container: deemph } = render(MaterialSymbol, {
			children: makeChild('map'),
			deemphasis: true
		})
		expect(deemph.querySelector('.material-symbols-deemphasis')).toBeTruthy()
	})

	it('applies size classes', async () => {
		const { container } = render(MaterialSymbol, { children: makeChild('map'), size: 'xl' })
		expect(container.querySelector('.material-symbols-xl')).toBeTruthy()
	})
})

const makeChild = (text: string) =>
	createRawSnippet(() => ({
		render: () => `<div class="display-contents">${text}</div>`
	}))
