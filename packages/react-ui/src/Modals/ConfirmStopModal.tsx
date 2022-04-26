import React, { useCallback, useState } from 'react'
import clsx from 'clsx'
import { Modal, ModalProps } from '../Modal'
import Link from 'next/link'

type ConfirmValue = 'yes' | 'no'

export interface ConfirmStopModalProps extends ModalProps {
  vehicleName?: string
  vehicleUrl?: string
  onConfirmValue: (value: ConfirmValue) => void
}

const styles = {
  prompt: 'text-md font-display font-light',
  options: 'flex flex-col my-4',
  option: 'flex mb-2 items center',
  radio: 'my-auto mr-2 accent-violet-600',
}

const RadioOption: React.FC<{
  label: string
  name: string
  id: string
  value: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ name, value, id, label, checked, onChange: handleChange }) => (
  <li className={styles.option}>
    <input
      type="radio"
      name={name}
      value={value}
      id={id}
      className={styles.radio}
      checked={checked}
      onChange={handleChange}
      aria-label={label}
    />
    <label htmlFor={id}>{label}</label>
  </li>
)

export const ConfirmStopModal: React.FC<ConfirmStopModalProps> = ({
  vehicleName,
  vehicleUrl,
  onConfirmValue: handleConfirmValue,
  ...modalProps
}) => {
  if (modalProps.onConfirm) {
    throw new Error(
      "ConfirmStopModal does not support default 'onConfirm' method. Use 'onConfirmValue' instead."
    )
  }

  const [confirmValue, setConfirmValue] = useState(null as null | ConfirmValue)

  const handleConfirm = useCallback(() => {
    handleConfirmValue(confirmValue as ConfirmValue)
  }, [confirmValue, handleConfirmValue])

  const handleChangeValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmValue(event.target.value as ConfirmValue)
    },
    [setConfirmValue]
  )

  return (
    <Modal
      {...modalProps}
      onConfirm={handleConfirm}
      disableConfirm={!confirmValue}
      title={
        <p className={styles.prompt}>
          This will stop this mission, even if it&apos;s not complete, and pause
          the mission
          {vehicleName && vehicleUrl && (
            <>
              {' '}
              <Link href={vehicleUrl}>
                <a className="text-teal-500">{vehicleName}</a>
              </Link>
            </>
          )}
          . Is that right?
        </p>
      }
    >
      {/* Not utilizing a dedicated form component due to simplicity of this dialog. */}
      <form>
        <ol className={styles.options}>
          <RadioOption
            label="Yes, stop the mission and pause the scheduler."
            name="confirm"
            id="yes"
            value="yes"
            checked={confirmValue === 'yes'}
            onChange={handleChangeValue}
          />
          <RadioOption
            label="No"
            name="confirm"
            id="no"
            value="no"
            checked={confirmValue === 'no'}
            onChange={handleChangeValue}
          />
        </ol>
      </form>
    </Modal>
  )
}

ConfirmStopModal.displayName = 'Components.ConfirmStopModal'
