<script lang="ts">
	import type { MapLocation } from '$lib/types'
	import LocationBoxEditor from './LocationBoxEditor.svelte'
	import {
		LocationsTabContext,
		setLocationsTabContext
	} from './LocationsTab/LocationsTabContext.svelte'

	interface Props {
		box: MapLocation
		context?: LocationsTabContext
	}
	const { box, context = new LocationsTabContext() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationBoxEditor {box} />
