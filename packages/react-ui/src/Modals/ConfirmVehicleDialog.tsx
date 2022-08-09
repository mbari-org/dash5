import clsx from 'clsx'
import React, { useState } from 'react'
import { SelectField } from '../Fields'
import { Dialog } from '../Modal/Dialog'
import { FooterProps } from '../Modal/Footer'

export interface ConfirmVehicleDialogProps extends FooterProps {
  vehicle: string
  vehicleList: string[]
  mission?: string
  command?: string
  onSubmit?: (vehicle: string) => void
}

const styles = {
  radio: 'checked:accent-teal-500 w-5 h-5 mr-2',
  li: 'flex items-center',
  select: 'ml-2 w-1/2',
}

export const ConfirmVehicleDialog: React.FC<ConfirmVehicleDialogProps> = ({
  vehicle,
  mission,
  command,
  vehicleList,
  onConfirm,
  onCancel,
  onSubmit,
}) => {
  const [differentVehicle, setDifferentVehicle] =
    useState<string | undefined>(undefined)

  const [isCorrectVehicle, setIsCorrectVehicle] = useState(true)
  const title = (
    <div>
      This {mission ? 'mission' : 'command'} should be scheduled for{' '}
      <span className="text-teal-500" data-testid="currentVehicle">
        {isCorrectVehicle ? vehicle : differentVehicle ?? vehicle}
      </span>
      . Is that right?
    </div>
  )

  const vehicleOptions = vehicleList.map((name) => ({
    id: name,
    name,
  }))

  const handleConfirm = () => {
    const confirmedVehicle = isCorrectVehicle ? vehicle : differentVehicle

    onSubmit?.(confirmedVehicle ?? vehicle)
  }

  const message = (
    <ul>
      <li className={styles.li}>
        <input
          className={styles.radio}
          type="radio"
          name="vehicle"
          id="default"
          data-testid="default"
          onChange={() => setIsCorrectVehicle(true)}
          checked={isCorrectVehicle}
        />
        <label htmlFor="default">
          Yes, {vehicle} should do {mission ? mission : command}
        </label>
      </li>
      <li className={clsx(styles.li, 'mt-4')}>
        <input
          className={styles.radio}
          type="radio"
          name="vehicle"
          id="selected"
          data-testid="selected"
          onChange={() => setIsCorrectVehicle(false)}
          checked={!isCorrectVehicle}
        />
        <label htmlFor="selected">No, this is for:</label>
        <SelectField
          name="vehicle list"
          className={styles.select}
          options={vehicleOptions}
          placeholder="Select LRAUV"
          value={differentVehicle}
          onSelect={(id) => setDifferentVehicle(id ?? vehicle)}
          required={!isCorrectVehicle}
        />
      </li>
    </ul>
  )

  return (
    <Dialog
      open
      title={title}
      message={message}
      onConfirm={onSubmit ? handleConfirm : onConfirm}
      onCancel={onCancel}
      disableConfirm={!isCorrectVehicle && !differentVehicle}
    />
  )
}
