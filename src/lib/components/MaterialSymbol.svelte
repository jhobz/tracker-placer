<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		children,
		class: className,
		emphasis,
		deemphasis,
		size,
		...props
	}: {
		children: Snippet
		emphasis?: boolean
		deemphasis?: boolean
		size?: 'sm' | 'md' | 'lg' | 'xl' | '4xl'
	} & HTMLAttributes<HTMLSpanElement> = $props()
</script>

<span
	class={{
		'material-symbols-outlined': true,
		'material-symbols-emphasis': emphasis,
		'material-symbols-deemphasis': deemphasis,
		[`material-symbols-${size}`]: !!size,
		[className?.toString() ?? '']: !!className
	}}
	{...props}
>
	{@render children()}
</span>

<style>
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
		font-size: var(--text-lg);

		&.material-symbols-emphasis {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' 200,
				'opsz' 24;
		}

		&.material-symbols-deemphasis {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' -25,
				'opsz' 24;
		}

		&.material-symbols-sm {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' 0,
				'opsz' 20;
			font-size: var(--text-base);

			&.material-symbols-emphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' 200,
					'opsz' 20;
			}

			&.material-symbols-deemphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' -25,
					'opsz' 20;
			}
		}

		&.material-symbols-lg {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' 0,
				'opsz' 40;
			font-size: var(--text-xl);

			&.material-symbols-emphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' 200,
					'opsz' 40;
			}

			&.material-symbols-deemphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' -25,
					'opsz' 40;
			}
		}

		&.material-symbols-xl {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' 0,
				'opsz' 48;
			font-size: var(--text-2xl);

			&.material-symbols-emphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' 200,
					'opsz' 48;
			}

			&.material-symbols-deemphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' -25,
					'opsz' 48;
			}
		}

		&.material-symbols-4xl {
			font-variation-settings:
				'FILL' 0,
				'wght' 400,
				'GRAD' 0,
				'opsz' 48;
			font-size: var(--text-6xl);

			&.material-symbols-emphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' 200,
					'opsz' 48;
			}

			&.material-symbols-deemphasis {
				font-variation-settings:
					'FILL' 0,
					'wght' 400,
					'GRAD' -25,
					'opsz' 48;
			}
		}
	}
</style>
