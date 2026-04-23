<script lang="ts">
	import type { Location } from '$lib/types'
	import LocationList from './LocationList.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	interface Props {
		locations?: Location[] | null
		context?: LocationsTabContext
	}
	const { locations = [], context = new LocationsTabContext() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationList {locations} />
