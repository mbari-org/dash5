import { atom, useRecoilState } from 'recoil'

interface UseManagedMapMarkersState {
  id: string
  index: number
  lat: number
  lon: number
}

const managedMapMarkers = atom<UseManagedMapMarkersState[] | null>({
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
