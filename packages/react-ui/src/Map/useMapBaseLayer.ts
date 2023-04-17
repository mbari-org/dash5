import { atom, useRecoilState } from 'recoil'

export type BaseLayerOption =
  | 'Google Hybrid'
  | 'ESRI Oceans/Labels'
  | 'GMRT'
  | 'OpenStreetmaps'
  | 'Dark Layer (CARTO)'

export interface UseMapBaseLayerState {
  baseLayer: BaseLayerOption
}

const baseLayerState = atom<UseMapBaseLayerState | null>({
  key: 'baseLayerState',
  default: { baseLayer: 'Google Hybrid' },
})

export const useMapBaseLayer = () => {
  const [state, setState] = useRecoilState(baseLayerState)
  const setBaseLayer = (baseLayer: BaseLayerOption) => setState({ baseLayer })
  return {
    baseLayer: state?.baseLayer,
    setBaseLayer,
  }
}
