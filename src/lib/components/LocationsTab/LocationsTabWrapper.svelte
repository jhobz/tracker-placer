<script lang="ts">
	import LocationsTab from './LocationsTab.svelte'
	import { LocationsTabContext, setLocationsTabContext } from './LocationsTabContext.svelte'

	interface Props {
		context?: LocationsTabContext
	}
	const { context = new LocationsTabContext() }: Props = $props()

	setLocationsTabContext((() => context)())
</script>

<LocationsTab />
