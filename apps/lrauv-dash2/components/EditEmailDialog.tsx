import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '@mbari/react-ui'
import { useSendVerificationCode } from '@mbari/api-client'
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
  onSave: (newEmail: string, code: string) => void
  onDelete: () => void
  isSaving?: boolean
  isDeleting?: boolean
}

type Step = 'edit' | 'verify'

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
  const [step, setStep] = useState<Step>('edit')
  const [code, setCode] = useState('')
  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  const { mutate: sendCode, isLoading: isSendingCode } =
    useSendVerificationCode()
  const [sendCodeFailed, setSendCodeFailed] = useState(false)

  const trimmed = value.trim()
  const normalized = destType === 'phone' ? normalizePhone(trimmed) : trimmed
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
  const isAddressValid = isValueValid && !isUnchanged && !isDuplicate

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

  const isBusy = isSaving || isDeleting || isSendingCode

  // Start countdown timer when we enter verify step
  useEffect(() => {
    if (step !== 'verify' || expiresInSeconds === null) return
    setCountdown(expiresInSeconds)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [step, expiresInSeconds])

  // Focus the code input when we switch to verify step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => codeInputRef.current?.focus(), 50)
    }
  }, [step])

  const handleSendCode = () => {
    const recipient = destType === 'phone' ? normalized : trimmed
    setSendCodeFailed(false)
    sendCode(
      { recipient },
      {
        onSuccess: (data) => {
          setExpiresInSeconds(data.result?.expiresInSeconds ?? 300)
          setStep('verify')
        },
        onError: () => {
          setSendCodeFailed(true)
        },
      }
    )
  }

  const handleConfirm = () => {
    if (step === 'edit') {
      if (isAddressValid && !isBusy) handleSendCode()
    } else {
      const finalEmail = destType === 'phone' ? normalized : trimmed
      if (code.trim() && !isBusy) onSave(finalEmail, code.trim())
    }
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const isVerifyStep = step === 'verify'
  const codeExpired = countdown !== null && countdown <= 0

  return (
    <Modal
      title={
        <span className="text-lg font-bold">Edit notification destination</span>
      }
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmButtonText={
        isSendingCode
          ? 'Sending code…'
          : isSaving
          ? 'Saving…'
          : isVerifyStep
          ? 'Save'
          : 'Send verification code'
      }
      disableConfirm={
        isVerifyStep
          ? !code.trim() || codeExpired || isBusy
          : !isAddressValid || isBusy
      }
      cancelButtonText={isVerifyStep ? 'Back' : 'Cancel'}
      onCancel={
        isVerifyStep
          ? () => {
              setStep('edit')
              setCode('')
              setCountdown(null)
            }
          : onClose
      }
      extraButtons={
        isVerifyStep
          ? []
          : [
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
            ]
      }
      blurBackground
      style={{ minWidth: 420 }}
    >
      {!isVerifyStep ? (
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
                if (e.key === 'Enter' && isAddressValid && !isBusy)
                  handleConfirm()
              }}
            />
            {errorMsg && (
              <span className="text-xs text-red-600">{errorMsg}</span>
            )}
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

          {sendCodeFailed && (
            <p className="text-xs text-red-600">
              Failed to send verification code. Please try again.
            </p>
          )}
        </article>
      ) : (
        <article className="flex flex-col gap-4 pb-2">
          <p className="text-sm text-stone-700">
            A verification code was sent to{' '}
            <span className="font-medium">
              {destType === 'phone' ? normalized : trimmed}
            </span>
            . Enter it below to confirm you control this address.
          </p>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-verify-code"
              className="text-xs font-medium text-teal-700"
            >
              Verification code:
            </label>
            <input
              id="edit-verify-code"
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              className={`w-full rounded border-b px-0 py-1 text-sm tracking-widest focus:outline-none ${
                codeExpired ? 'border-red-400' : 'border-stone-400'
              }`}
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.trim() && !codeExpired && !isBusy)
                  handleConfirm()
              }}
            />
          </div>

          {countdown !== null && (
            <p
              className={`text-xs ${
                codeExpired ? 'text-red-600' : 'text-stone-500'
              }`}
            >
              {codeExpired
                ? 'Code expired. Go back and try again.'
                : `Code expires in ${formatCountdown(countdown)}`}
            </p>
          )}
        </article>
      )}
    </Modal>
  )
}

export default EditEmailDialog
