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
  const lastDeployment = useLastDeployment({
    vehicle: vehicleName,
    to: new Date().toISOString(),
  })

  const lastEvent = lastDeployment.data?.lastEvent
  return lastDeployment.isLoading ? null : (
    <VehicleDropdownOption
      name={vehicleName}
      status={lastDeployment.data?.active ? 'deployed' : 'ended'}
      missionName={lastDeployment.data?.name}
      lastEvent={lastEvent && new Date(lastEvent).toISOString()}
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
        .filter((n: string) => trackedVehicles.indexOf(n) < 0)
        .map((name: string) => ({
          label: <LastDeploymentOption vehicleName={name} key={name} />,
          onSelect: () => {
            setTrackedVehicles([...trackedVehicles, name])
          },
        }))}
    />
  )
}

export default VehicleDeploymentDropdown
