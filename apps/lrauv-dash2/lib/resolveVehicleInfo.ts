import { GetVehicleInfoResponse } from '@mbari/api-client'

export const resolveVehicleInfo = (
  vehicleInfo: GetVehicleInfoResponse | { not_found: boolean } | undefined
): GetVehicleInfoResponse | undefined =>
  vehicleInfo?.not_found || !vehicleInfo
    ? undefined
    : (vehicleInfo as GetVehicleInfoResponse)
