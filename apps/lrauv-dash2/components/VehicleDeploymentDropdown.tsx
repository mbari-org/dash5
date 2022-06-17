import React from 'react'
import {
  VehicleDropdown,
  VehicleDropdownOption,
  DropdownProps,
} from '@mbari/react-ui'
import { useSortedVehicleNames, useLastDeployment } from '@mbari/api-client'
import useTrackedVehicles from '../lib/useTrackedVehicles'

const LastDeploymentOption: React.FC<{ vehicleName: string }> = ({
  vehicleName,
}) => {
  const lastDeployment = useLastDeployment(
    {
      vehicle: vehicleName,
      to: new Date().toISOString(),
    },
    {
      enabled: vehicleName !== '',
    }
  )

  const lastEvent = lastDeployment.data?.lastEvent
  return lastDeployment.isLoading ? null : (
    <VehicleDropdownOption
      name={vehicleName}
      status={lastDeployment.data?.active ? 'deployed' : 'ended'}
      missionName={lastDeployment.data?.name}
      lastEvent={lastEvent ? new Date(lastEvent).toISOString() : undefined}
    />
  )
}

const VehicleDeploymentDropdown: React.FC<Omit<DropdownProps, 'options'>> = (
  props
) => {
  const { setTrackedVehicles, trackedVehicles } = useTrackedVehicles()
  const vehicleNamesQuery = useSortedVehicleNames({ refresh: 'y' })
  const vehicleNames = vehicleNamesQuery.data ?? []
  return (
    <VehicleDropdown
      {...props}
      options={vehicleNames
        .filter(
          ({ vehicleName }) => trackedVehicles.indexOf(vehicleName ?? '') < 0
        )
        .filter(({ vehicleName }) => (vehicleName ?? '') !== '')
        .map(({ vehicleName }) => ({
          label: (
            <LastDeploymentOption
              vehicleName={vehicleName ?? ''}
              key={vehicleName}
            />
          ),
          onSelect: () => {
            setTrackedVehicles([...trackedVehicles, vehicleName ?? ''])
          },
        }))}
    />
  )
}

export default VehicleDeploymentDropdown
