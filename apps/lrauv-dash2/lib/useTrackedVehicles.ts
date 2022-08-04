import { useEffect, useRef } from 'react'
import useCookie from 'react-use-cookie'
import { atom, useRecoilState } from 'recoil'

const trackedVehiclesState = atom<string[]>({
  key: 'trackedVehiclesState',
  default: [],
})

const SEPARATOR = '::'

const useTrackedVehicles = () => {
  const [vehicleIds, setVehicleIds] = useCookie(
    'TETHYS_DASH_TRACKED_VEHICLES',
    ''
  )

  const [trackedVehicles, setTrackedVehiclesState] =
    useRecoilState(trackedVehiclesState)

  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) {
      return
    }
    mounted.current = true
    setTrackedVehiclesState(vehicleIds.split(SEPARATOR).filter((s) => s.length))
  }, [setTrackedVehiclesState, vehicleIds])

  const setTrackedVehicles = (vehicleIds: string[]) => {
    setTrackedVehiclesState(vehicleIds)
    setVehicleIds(vehicleIds.join(SEPARATOR), {
      days: 7,
      SameSite: 'Strict',
      Secure:
        typeof window !== 'undefined' && window.location.protocol === 'https:',
    })
  }

  return {
    trackedVehicles,
    setTrackedVehicles,
  }
}

export default useTrackedVehicles
