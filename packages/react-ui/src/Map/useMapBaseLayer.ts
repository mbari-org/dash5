import { atom, useRecoilState } from 'recoil'

export type BaseLayerOption =
  | 'GMRT'
  | 'OpenStreetmaps'
  | 'ESRI Oceans/Labels'
  | 'Dark Layer (CARTO)'

export interface UseMapBaseLayerState {
  baseLayer: BaseLayerOption
}

const baseLayerState = atom<UseMapBaseLayerState | null>({
  key: 'baseLayerState',
  default: { baseLayer: 'GMRT' },
})

export const useMapBaseLayer = () => {
  const [state, setState] = useRecoilState(baseLayerState)
  const setBaseLayer = (baseLayer: BaseLayerOption) => setState({ baseLayer })
  return {
    baseLayer: state?.baseLayer,
    setBaseLayer,
  }
}
