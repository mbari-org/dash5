import { Select } from '../../Fields/Select'
import React, { useState } from 'react'

export interface ConfirmVehicleProps {
  vehicleName: string
  mission: string
  vehicles?: string[]
  onConfirmedVehicleChanged?: (confirmedVehicle: string | null) => void
  confirmedVehicle?: string | null
}

export const ConfirmVehicleStep: React.FC<ConfirmVehicleProps> = ({
  vehicleName,
  mission,
  vehicles = [],
  confirmedVehicle = null,
  onConfirmedVehicleChanged,
}) => {
  const [useAlternate, setUseAlternate] = useState(false)
  const handleAlternateVehicle = () => {
    setUseAlternate(true)
    onConfirmedVehicleChanged?.(null)
  }

  const handleConfirmedVehicle = (address: string) => () => {
    onConfirmedVehicleChanged?.(address)
  }

  return (
    <article className="h-full">
      <ul className="ml-4 -mt-1 flex max-h-full flex-col">
        <li className="mr-4 flex py-2">
          <label
            htmlFor="confirmedVehicle"
            className="py-1"
            onClick={handleConfirmedVehicle(vehicleName)}
          >
            <input
              type="radio"
              value={vehicleName}
              name="confirmed"
              checked={confirmedVehicle === vehicleName}
              className="mr-2"
            />
            Yes, {vehicleName} should do {mission}
          </label>
        </li>
        <li className="mr-4 flex py-2">
          <label
            htmlFor="confirmedVehicle"
            className="mr-4 flex-shrink-0 py-1"
            onClick={handleAlternateVehicle}
          >
            <input
              type="radio"
              value="alternate"
              name="confirmed"
              checked={useAlternate}
              className="mr-2"
            />
            <span>No this is for:</span>
          </label>
          <Select
            options={vehicles.map((vehicle) => ({
              id: vehicle,
              name: vehicle,
            }))}
            name="confirmedVehicle"
            onSelect={onConfirmedVehicleChanged}
            value={confirmedVehicle ?? ''}
          />
        </li>
      </ul>
    </article>
  )
}
