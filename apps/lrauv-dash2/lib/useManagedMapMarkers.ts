import { atom, useRecoilState } from 'recoil'

export interface ManagedMapMarkers {
  id: string
  index: number
  lat: number
  lon: number
}

export interface UseManagedMapMarkersState {
  markers: ManagedMapMarkers[]
  editable?: boolean
}

const managedMapMarkers = atom<UseManagedMapMarkersState | null>({
  key: 'managedMapMarkers',
  default: null,
})

const useManagedMapMarkers = () => {
  const [mapMarkers, setMapMarkers] = useRecoilState(managedMapMarkers)

  return {
    mapMarkers,
    setMapMarkers,
  }
}

export default useManagedMapMarkers
