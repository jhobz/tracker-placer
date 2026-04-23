<script lang="ts">
	import type { MapConfig, MapLocation } from '$lib/types'
	import LocationBoxEditor from './LocationBoxEditor.svelte'
	import {
		LocationsTabContext,
		setLocationsTabContext
	} from './LocationsTab/LocationsTabContext.svelte'

	interface Props {
		map: MapConfig
		box: MapLocation
		context?: LocationsTabContext
	}
	const { map, box, context = new LocationsTabContext() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationBoxEditor {map} {box} />
