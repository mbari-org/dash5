import React from 'react'
import {
  VehicleDropdown,
  VehicleDropdownOption,
  DropdownProps,
} from '@mbari/react-ui'
import { useSortedVehicleNames, useLastDeployment } from '@mbari/api-client'

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

const VehicleDeploymentDropdown: React.FC<DropdownProps> = (props) => {
  const vehicleNamesQuery = useSortedVehicleNames()
  const vehicleNames = vehicleNamesQuery.data ?? []
  return (
    <VehicleDropdown
      {...props}
      options={vehicleNames.map((name: string) => ({
        label: <LastDeploymentOption vehicleName={name} key={name} />,
        onSelect: () => {
          console.log(name)
        },
      }))}
    />
  )
}

export default VehicleDeploymentDropdown
