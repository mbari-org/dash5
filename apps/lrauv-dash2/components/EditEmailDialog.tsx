import React, { useState } from 'react'
import { Modal } from '@mbari/react-ui'

interface EditEmailDialogProps {
  currentEmail: string
  existingEmails: string[]
  onClose: () => void
  onSave: (newEmail: string) => void
  onDelete: () => void
  isSaving?: boolean
  isDeleting?: boolean
}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const EditEmailDialog: React.FC<EditEmailDialogProps> = ({
  currentEmail,
  existingEmails,
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}) => {
  const [value, setValue] = useState(currentEmail)

  const trimmed = value.trim()
  const isUnchanged = trimmed.toLowerCase() === currentEmail.toLowerCase()
  const isDuplicate =
    !isUnchanged &&
    existingEmails.map((e) => e.toLowerCase()).includes(trimmed.toLowerCase())
  const isValid = isValidEmail(trimmed) && !isUnchanged && !isDuplicate

  const errorMsg = trimmed
    ? isUnchanged
      ? null
      : isDuplicate
      ? 'This address is already in the list.'
      : !isValidEmail(trimmed)
      ? 'Please enter a valid email address.'
      : null
    : null

  const isBusy = isSaving || isDeleting

  return (
    <Modal
      title={
        <span className="text-lg font-bold">Edit notification address</span>
      }
      open
      onClose={onClose}
      onConfirm={() => {
        if (isValid && !isBusy) onSave(trimmed)
      }}
      confirmButtonText={isSaving ? 'Saving…' : 'Save'}
      disableConfirm={!isValid || isBusy}
      cancelButtonText="Cancel"
      onCancel={onClose}
      extraButtons={[
        {
          buttonText: isDeleting ? 'Deleting…' : 'Delete address',
          appearance: 'destructive' as const,
          onClick: onDelete,
          disabled: isBusy,
        },
      ]}
      blurBackground
      style={{ minWidth: 420 }}
    >
      <article className="flex flex-col gap-3 pb-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-600">Address</label>
          <input
            autoFocus
            type="email"
            className={`w-full rounded border px-3 py-2 text-sm ${
              errorMsg ? 'border-red-400' : 'border-stone-300'
            }`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && !isBusy) onSave(trimmed)
            }}
          />
          {errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
        </div>
      </article>
    </Modal>
  )
}

export default EditEmailDialog
