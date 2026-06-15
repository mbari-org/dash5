export type DestinationType = 'email' | 'phone'

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
