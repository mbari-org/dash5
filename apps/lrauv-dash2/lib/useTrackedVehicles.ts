import useCookie from 'react-use-cookie'

const SEPARATOR = '::'

const useTrackedVehicles = () => {
  const [vehicleIds, setVehicleIds] = useCookie(
    'TETHYS_DASH_TRACKED_VEHICLES',
    ''
  )

  const setTrackedVehicles = (vehicleIds: string[]) => {
    setVehicleIds(vehicleIds.join(SEPARATOR), {
      days: 7,
      SameSite: 'Strict',
      Secure:
        typeof window !== 'undefined' && window.location.protocol === 'https:',
    })
  }

  return {
    trackedVehicles: vehicleIds.split(SEPARATOR).filter((s) => s.length),
    setTrackedVehicles,
  }
}

export default useTrackedVehicles
