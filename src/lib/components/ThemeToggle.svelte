<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'
</script>

<button class="btn btn-circle btn-ghost btn-sm" aria-label="Toggle theme">
	<label class="swap swap-rotate">
		<input
			type="checkbox"
			onchange={() => appState.toggleTheme()}
			checked={appState.theme === 'poptracker'}
		/>
		<MaterialSymbol class="swap-on">light_mode</MaterialSymbol>
		<MaterialSymbol class="swap-off">dark_mode</MaterialSymbol>
	</label>
</button>
