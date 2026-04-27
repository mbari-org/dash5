import { PluggedInIcon, SurfacedIcon, UnderwaterIcon } from '@mbari/react-ui'
import type { VehiclePhysicalStatus } from './useVehicleStatus'

export const vehiclePhysicalStatusIcon = (
  status: VehiclePhysicalStatus
): JSX.Element => {
  switch (status) {
    case 'pluggedIn':
      return <PluggedInIcon />
    case 'surfaced':
      return <SurfacedIcon />
    case 'underwater':
      return <UnderwaterIcon />
  }
}
