import { appState } from '$lib/state.svelte'
import type { Location } from '$lib/types'
import { createContext } from 'svelte'

export class LocationsTabContext {
	#path: string = $state('')
	#currentLocation: Location | null = $derived(
		this.#findChildrenByPath(this.#path, appState.selectedPack?.locations ?? [])
	)
	#locations: Location[] = $derived(
		this.#currentLocation?.children ?? appState.selectedPack?.locations ?? []
	)

	#findChildrenByPath(path: string, locations: Location[]): Location | null {
		const parts = path.split('/').filter(Boolean)
		if (!parts.length || parts[0] === '') {
			return null
		}

		let locs = locations
		let loc
		for (const part of parts) {
			loc = locs?.find((l) => l.name === part)
			if (!loc) {
				return null
			}

			locs = loc.children ?? []
		}

		return loc ?? null
	}

	get path() {
		return this.#path
	}

	get currentLocation() {
		return this.#currentLocation
	}

	get locations() {
		return this.#locations
	}

	appendToPath(segment: string) {
		this.#path += '/' + segment
	}
}

export const [getLocationsTabContext, setLocationsTabContext] = createContext<LocationsTabContext>()
