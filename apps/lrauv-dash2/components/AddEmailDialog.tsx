import React, { useState } from 'react'
import { Modal } from '@mbari/react-ui'

interface AddEmailDialogProps {
  existingEmails: string[]
  onClose: () => void
  onAdd: (email: string) => void
  isAdding?: boolean
}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const AddEmailDialog: React.FC<AddEmailDialogProps> = ({
  existingEmails,
  onClose,
  onAdd,
  isAdding,
}) => {
  const [value, setValue] = useState('')

  const trimmed = value.trim()
  const isDuplicate = existingEmails
    .map((e) => e.toLowerCase())
    .includes(trimmed.toLowerCase())
  const isValid = isValidEmail(trimmed) && !isDuplicate

  const errorMsg = trimmed
    ? isDuplicate
      ? 'This address is already in the list.'
      : !isValidEmail(trimmed)
      ? 'Please enter a valid email address.'
      : null
    : null

  return (
    <Modal
      title={
        <span className="text-lg font-bold">Add notification address</span>
      }
      open
      onClose={onClose}
      onConfirm={() => {
        if (isValid) onAdd(trimmed)
      }}
      confirmButtonText={isAdding ? 'Adding…' : 'Add'}
      disableConfirm={!isValid || isAdding}
      cancelButtonText="Cancel"
      onCancel={onClose}
      blurBackground
      style={{ minWidth: 420 }}
    >
      <article className="flex flex-col gap-3 pb-2">
        <p className="text-sm text-stone-600">
          Enter an email address or SMS gateway address (e.g.{' '}
          <span className="font-mono">5551234567@vtext.com</span>) to receive
          notifications.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor="add-email-input" className="text-xs text-stone-600">
            Address
          </label>
          <input
            id="add-email-input"
            autoFocus
            type="email"
            className={`w-full rounded border px-3 py-2 text-sm ${
              errorMsg ? 'border-red-400' : 'border-stone-300'
            }`}
            placeholder="e.g. alerts@example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && !isAdding) onAdd(trimmed)
            }}
          />
          {errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
        </div>
      </article>
    </Modal>
  )
}

export default AddEmailDialog
