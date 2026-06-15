export type DestinationType = 'email' | 'phone'

// Stores the specific destination address the user has chosen as their
// default (e.g. '+15551234567' or 'alerts@example.com').
const DEST_KEY = 'notification:defaultDest'

/** Returns the stored default destination address, or null if none is set. */
export const getDefaultDest = (): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(DEST_KEY) : null
  } catch {
    // localStorage unavailable (SSR, private browsing)
    return null
  }
}

/** Saves the given address as the user's default notification destination. */
export const saveDefaultDest = (address: string) => {
  try {
    localStorage.setItem(DEST_KEY, address)
  } catch {
    // ignore storage failures
  }
}

/**
 * Returns the DestinationType of the stored default destination.
 * Used to pre-select the radio in AddEmailDialog.
 * Falls back to 'email' when nothing is stored.
 */
export const getDefaultDestType = (): DestinationType => {
  const dest = getDefaultDest()
  return dest && isPhoneNumber(dest) ? 'phone' : 'email'
}

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// Strips spaces, dashes, dots, and parentheses before validating/saving,
// e.g. "+1 555 123 4567" → "+15551234567" (E.164-style).
export const normalizePhone = (value: string) => value.replace(/[\s\-().]/g, '')

export const isValidPhone = (value: string) =>
  /^\+[1-9]\d{6,14}$/.test(normalizePhone(value.trim()))

export const isPhoneNumber = (value: string) => isValidPhone(value)

export const SMS_CONSENT =
  'By adding a phone number you opt in to SMS alerts for the vehicles you select. Message & data rates may apply. Opt out anytime by removing the number here, or reply STOP. Replying STOP stops messages but does not remove the number from TethysDash.'
