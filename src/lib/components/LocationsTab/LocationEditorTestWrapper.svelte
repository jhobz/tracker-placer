<script lang="ts">
	import type { Location } from '$lib/types'
	import LocationEditor from './LocationEditor.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	interface Props {
		context?: LocationsTabContext
		location: Location
	}
	let { context = new LocationsTabContext(), location = $bindable() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationEditor bind:location />

<style>
</style>
