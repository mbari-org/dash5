/**
 * Derives the VehicleProps diagram status from deployment and mission data.
 * RECOVERED takes precedence over PLUGGED so a recovered-and-plugged vehicle
 * always renders in the terminal recovered state.
 *
 * Used by both VehicleList (overview) and VehicleDiagram (full page) to keep
 * the two views consistent.
 */
export const deriveVehiclePropsStatus = ({
  recoverEventId,
  missionText,
}: {
  recoverEventId?: number | string | null
  missionText?: string | null
}): 'recovered' | 'pluggedIn' | 'onMission' => {
  // Explicit null/undefined/empty-string check so a valid numeric id of 0
  // is not mistakenly treated as absent (truthiness would coerce 0 to false).
  if (
    (recoverEventId != null && recoverEventId !== '') ||
    missionText?.includes('RECOVERED')
  )
    return 'recovered'
  if (missionText?.includes('PLUGGED')) return 'pluggedIn'
  return 'onMission'
}
