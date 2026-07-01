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
  if (recoverEventId || missionText?.includes('RECOVERED')) return 'recovered'
  if (missionText?.includes('PLUGGED')) return 'pluggedIn'
  return 'onMission'
}
