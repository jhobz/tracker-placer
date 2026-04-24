<script lang="ts">
	import SectionEditor from '$lib/components/SectionEditor.svelte'
	import type { Location } from '$lib/types'
	import LocationList from './LocationList.svelte'
	import { getLocationsTabContext } from './LocationsTabContext.svelte'

	type Props = {
		location: Location
	}
	let { location = $bindable() }: Props = $props()

	if (!location) {
		throw new Error('LocationEditor requires a valid location prop')
	}

	const context = getLocationsTabContext()

	function removeLocation(location: Location) {
		context.walkUpPath(1)
		const locs = context.currentChildren
		if (!locs) {
			throw new Error('Cannot remove location: parent array not found')
		}

		locs.splice(locs.indexOf(location), 1)
	}

	function convertRulesToString(
		rules: Location['access_rules'] | Location['visibility_rules']
	): string {
		if (!rules) {
			return ''
		}
		if (typeof rules === 'string') {
			return rules
		}
		if (Array.isArray(rules) && rules.every((r) => typeof r === 'string')) {
			return rules.join('\n')
		}
		return rules.flatMap((r) => (typeof r === 'string' ? [r] : r)).join('\n')
	}
</script>

<div class="flex flex-col gap-2">
	<!-- Name -->
	<label>
		<div class="label py-0">
			<span class="label-text text-xs">Location Name</span>
		</div>
		<input
			type="text"
			name="location-name"
			class="input-bordered input input-sm w-full"
			bind:value={location.name}
			placeholder="e.g. Eastern Palace"
		/>
	</label>

	<!-- Icon fields -->
	<div class="flex gap-2">
		<label class="x-1">
			<div class="label py-0">
				<span class="label-text text-xs">Chest Unopened Img</span>
			</div>
			<input
				type="text"
				name="chest-unopened"
				class="input-bordered input input-xs w-full font-mono"
				bind:value={location.chest_unopened_img}
				placeholder="images/items/chest.png"
			/>
		</label>
		<label class="x-1">
			<div class="label py-0">
				<span class="label-text text-xs">Chest Opened Img</span>
			</div>
			<input
				type="text"
				name="chest-opened"
				class="input-bordered input input-xs w-full font-mono"
				bind:value={location.chest_opened_img}
				placeholder="images/items/chest_open.png"
			/>
		</label>
	</div>

	<!-- Access rules -->
	<label class="w-full">
		<div class="label py-0">
			<span class="label-text text-xs">Access Rules</span>
			<span class="label-text-alt text-xs opacity-50">one per line</span>
		</div>
		<textarea
			name="access-rules"
			class="textarea-bordered textarea w-full font-mono textarea-xs"
			rows="2"
			placeholder={'{item1},{item2}'}
			value={convertRulesToString(location.access_rules)}
			onchange={(e) => {
				location.access_rules = (e.target as HTMLTextAreaElement).value
					.split('\n')
					.map((r) => r.trim())
					.filter((r) => r.length > 0)
			}}
		></textarea>
	</label>

	<!-- Visibility rules -->
	<label class="w-full">
		<div class="label py-0">
			<span class="label-text text-xs">Visibility Rules</span>
			<span class="label-text-alt text-xs opacity-50">one per line</span>
		</div>
		<textarea
			name="visibility-rules"
			class="textarea-bordered textarea w-full font-mono textarea-xs"
			rows="2"
			placeholder={'{setting}'}
			value={convertRulesToString(location.visibility_rules)}
			onchange={(e) => {
				location.visibility_rules = (e.target as HTMLTextAreaElement).value
					.split('\n')
					.map((r) => r.trim())
					.filter((r) => r.length > 0)
			}}
		></textarea>
	</label>

	<!-- Child locations -->
	<h3 class="text-sm font-medium">Children</h3>
	<LocationList locations={context.currentChildren} />

	<!-- Sections -->
	<div class="divider my-0 text-xs opacity-50"></div>
	<SectionEditor sections={location.sections ?? []} />
	<div class="divider my-0 text-xs opacity-50"></div>

	<button
		class="btn btn-soft btn-error"
		onclick={() => removeLocation(location)}
		title="Delete location"
		aria-label="Delete location"
	>
		Delete location
	</button>
</div>
