import { atom, useRecoilState, RecoilState } from 'recoil'

export type BaseLayerOption =
  | 'Google Hybrid'
  | 'ESRI Oceans/Labels'
  | 'GMRT'
  | 'OpenStreetmaps'
  | 'Dark Layer (CARTO)'

export interface UseMapBaseLayerState {
  baseLayer: BaseLayerOption
}

// Cache of atoms by ID to prevent recreation
const atomCache: Record<string, RecoilState<UseMapBaseLayerState | null>> = {}

/**
 * Get or create an atom for a specific map instance
 * @param id - Unique identifier for this map instance
 * @returns Recoil atom with unique key
 */
const getBaseLayerAtom = (id: string = 'default') => {
  // Use cached atom if one exists for this ID
  if (!atomCache[id]) {
    atomCache[id] = atom<UseMapBaseLayerState | null>({
      key: `baseLayerState-${id}`,
      default: { baseLayer: 'Google Hybrid' },
    })
  }
  return atomCache[id]
}

/**
 * Hook to manage the base layer state for a map
 * @param id - Optional ID for cases where multiple maps exist (defaults to 'default')
 * @returns Object containing baseLayer and setBaseLayer
 */
export const useMapBaseLayer = (id: string = 'default') => {
  // Get or create atom for this specific map instance
  const baseLayerState = getBaseLayerAtom(id)

  // Use the atom with Recoil as normal
  const [state, setState] = useRecoilState(baseLayerState)

  const setBaseLayer = (baseLayer: BaseLayerOption) => setState({ baseLayer })

  return {
    baseLayer: state?.baseLayer,
    setBaseLayer,
  }
}
