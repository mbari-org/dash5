import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '@mbari/react-ui'
import { useSendVerificationCode } from '@mbari/api-client'
import {
  DestinationType,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  SMS_CONSENT,
  getDefaultDestType,
} from '../lib/notificationDestinations'

interface AddEmailDialogProps {
  existingEmails: string[]
  onClose: () => void
  onAdd: (email: string, code: string, makeDefault?: boolean) => void
  isAdding?: boolean
}

type Step = 'enter' | 'verify'

const AddEmailDialog: React.FC<AddEmailDialogProps> = ({
  existingEmails,
  onClose,
  onAdd,
  isAdding,
}) => {
  const [destType, setDestType] = useState<DestinationType>(getDefaultDestType)
  const [makeDefault, setMakeDefault] = useState(false)
  const [value, setValue] = useState('')
  const [step, setStep] = useState<Step>('enter')
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
  const isDuplicate = existingEmails
    .map((e) => (destType === 'phone' ? normalizePhone(e) : e).toLowerCase())
    .includes(normalized.toLowerCase())

  const isValueValid =
    destType === 'email' ? isValidEmail(trimmed) : isValidPhone(trimmed)
  const isAddressValid = isValueValid && !isDuplicate

  const errorMsg = trimmed
    ? isDuplicate
      ? 'This destination is already in the list.'
      : !isValueValid
      ? destType === 'email'
        ? 'Please enter a valid email address.'
        : 'Please enter a valid phone number in international format, e.g. +1 555 123 4567.'
      : null
    : null

  const isBusy = isAdding || isSendingCode

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
    if (step === 'enter') {
      if (isAddressValid && !isBusy) handleSendCode()
    } else {
      const finalEmail = destType === 'phone' ? normalized : trimmed
      if (code.trim() && !isBusy) onAdd(finalEmail, code.trim(), makeDefault)
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
        <span className="text-lg font-bold">Add notification destination</span>
      }
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmButtonText={
        isSendingCode
          ? 'Sending code…'
          : isAdding
          ? 'Adding…'
          : isVerifyStep
          ? 'Add'
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
              setStep('enter')
              setCode('')
              setCountdown(null)
            }
          : onClose
      }
      blurBackground
      style={{ minWidth: 420 }}
    >
      {!isVerifyStep ? (
        <article className="flex flex-col gap-4 pb-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm text-stone-600">
              Destination type:
            </legend>
            <div className="flex gap-6">
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
                      setMakeDefault(false)
                    }}
                    className="accent-teal-600"
                  />
                  {type === 'email' ? 'Email address' : 'Phone number'}
                </label>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-500">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="accent-teal-600"
              />
              Make this my default notification destination
            </label>
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
              htmlFor="add-verify-code"
              className="text-xs font-medium text-teal-700"
            >
              Verification code:
            </label>
            <input
              id="add-verify-code"
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

export default AddEmailDialog
