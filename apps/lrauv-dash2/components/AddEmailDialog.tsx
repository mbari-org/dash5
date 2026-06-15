import React, { useState } from 'react'
import { Modal } from '@mbari/react-ui'
import {
  DestinationType,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  SMS_CONSENT,
} from '../lib/notificationDestinations'

interface AddEmailDialogProps {
  existingEmails: string[]
  onClose: () => void
  onAdd: (email: string) => void
  isAdding?: boolean
}

const AddEmailDialog: React.FC<AddEmailDialogProps> = ({
  existingEmails,
  onClose,
  onAdd,
  isAdding,
}) => {
  const [destType, setDestType] = useState<DestinationType>('email')
  const [value, setValue] = useState('')

  const trimmed = value.trim()
  const normalized = destType === 'phone' ? normalizePhone(trimmed) : trimmed
  const isDuplicate = existingEmails
    .map((e) => e.toLowerCase())
    .includes(normalized.toLowerCase())

  const isValueValid =
    destType === 'email' ? isValidEmail(trimmed) : isValidPhone(trimmed)
  const isValid = isValueValid && !isDuplicate

  const errorMsg = trimmed
    ? isDuplicate
      ? 'This destination is already in the list.'
      : !isValueValid
      ? destType === 'email'
        ? 'Please enter a valid email address.'
        : 'Please enter a valid phone number in international format, e.g. +1 555 123 4567.'
      : null
    : null

  const handleConfirm = () => {
    if (isValid) onAdd(destType === 'phone' ? normalized : trimmed)
  }

  return (
    <Modal
      title={
        <span className="text-lg font-bold">Add notification destination</span>
      }
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmButtonText={isAdding ? 'Adding…' : 'Add'}
      disableConfirm={!isValid || isAdding}
      cancelButtonText="Cancel"
      onCancel={onClose}
      blurBackground
      style={{ minWidth: 420 }}
    >
      <article className="flex flex-col gap-4 pb-2">
        <fieldset className="flex gap-6">
          <legend className="mb-2 text-sm text-stone-600">
            Destination type:
          </legend>
          {(['email', 'phone'] as DestinationType[]).map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="dest-type"
                value={type}
                checked={destType === type}
                onChange={() => {
                  setDestType(type)
                  setValue('')
                }}
                className="accent-teal-600"
              />
              {type === 'email' ? 'Email address' : 'Phone number'}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="add-dest-input"
            className="text-xs font-medium text-teal-700"
          >
            {destType === 'email' ? 'Email address:' : 'Phone number:'}
          </label>
          <input
            id="add-dest-input"
            key={destType}
            autoFocus
            type={destType === 'email' ? 'email' : 'tel'}
            className={`w-full rounded border-b px-0 py-1 text-sm focus:outline-none ${
              errorMsg ? 'border-red-400' : 'border-stone-400'
            }`}
            placeholder={
              destType === 'email'
                ? 'e.g. alerts@example.com'
                : '+1 555 123 4567'
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && !isAdding) handleConfirm()
            }}
          />
          {errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
        </div>

        {destType === 'phone' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs italic text-stone-500">
              Enter in international format, starting with &lsquo;+&rsquo; and
              the country code, e.g. +1 555 123 4567.
            </p>
            <p className="text-xs italic text-stone-500">{SMS_CONSENT}</p>
          </div>
        )}
      </article>
    </Modal>
  )
}

export default AddEmailDialog
