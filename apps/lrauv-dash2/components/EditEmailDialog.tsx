import React, { useState } from 'react'
import { Modal } from '@mbari/react-ui'
import {
  DestinationType,
  isValidEmail,
  isValidPhone,
  isPhoneNumber,
  normalizePhone,
  SMS_CONSENT,
} from '../lib/notificationDestinations'

interface EditEmailDialogProps {
  currentEmail: string
  existingEmails: string[]
  onClose: () => void
  onSave: (newEmail: string) => void
  onDelete: () => void
  isSaving?: boolean
  isDeleting?: boolean
}

const EditEmailDialog: React.FC<EditEmailDialogProps> = ({
  currentEmail,
  existingEmails,
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}) => {
  const initialType: DestinationType = isPhoneNumber(currentEmail)
    ? 'phone'
    : 'email'
  const [destType, setDestType] = useState<DestinationType>(initialType)
  const [value, setValue] = useState(currentEmail)

  const trimmed = value.trim()
  const normalized = destType === 'phone' ? normalizePhone(trimmed) : trimmed
  // Normalize currentEmail the same way so a pre-formatted phone like
  // "+1 555 123 4567" correctly compares equal to its stored value.
  const normalizedCurrent =
    initialType === 'phone' ? normalizePhone(currentEmail) : currentEmail
  const isUnchanged =
    normalized.toLowerCase() === normalizedCurrent.toLowerCase()
  const isDuplicate =
    !isUnchanged &&
    existingEmails
      .map((e) => (destType === 'phone' ? normalizePhone(e) : e).toLowerCase())
      .includes(normalized.toLowerCase())

  const isValueValid =
    destType === 'email' ? isValidEmail(trimmed) : isValidPhone(trimmed)
  const isValid = isValueValid && !isUnchanged && !isDuplicate

  const errorMsg = trimmed
    ? isUnchanged
      ? null
      : isDuplicate
      ? 'This destination is already in the list.'
      : !isValueValid
      ? destType === 'email'
        ? 'Please enter a valid email address.'
        : 'Please enter a valid phone number in international format, e.g. +1 555 123 4567.'
      : null
    : null

  const isBusy = isSaving || isDeleting

  const handleConfirm = () => {
    if (isValid && !isBusy) onSave(destType === 'phone' ? normalized : trimmed)
  }

  return (
    <Modal
      title={
        <span className="text-lg font-bold">Edit notification destination</span>
      }
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmButtonText={isSaving ? 'Saving…' : 'Save'}
      disableConfirm={!isValid || isBusy}
      cancelButtonText="Cancel"
      onCancel={onClose}
      extraButtons={[
        {
          buttonText: isDeleting
            ? 'Deleting…'
            : initialType === 'phone'
            ? 'Delete phone number'
            : 'Delete address',
          appearance: 'destructive' as const,
          onClick: onDelete,
          disabled: isBusy,
        },
      ]}
      blurBackground
      style={{ minWidth: 420 }}
    >
      <article className="flex flex-col gap-4 pb-2">
        <fieldset className="flex gap-6">
          <legend className="mb-2 text-sm text-stone-600">
            Change this to:
          </legend>
          {(['email', 'phone'] as DestinationType[]).map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="edit-dest-type"
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
            htmlFor="edit-dest-input"
            className="text-xs font-medium text-teal-700"
          >
            {destType === 'email' ? 'Email address:' : 'Phone number:'}
          </label>
          <input
            id="edit-dest-input"
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
              if (e.key === 'Enter' && isValid && !isBusy) handleConfirm()
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

export default EditEmailDialog
