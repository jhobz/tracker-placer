<script lang="ts">
	import type { Location } from '$lib/types'
	import LocationList from './LocationList.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	interface Props {
		locations?: Location[] | null
		readonly?: boolean
		context?: LocationsTabContext
	}
	const { locations = [], readonly = false, context = new LocationsTabContext() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationList {locations} {readonly} />
