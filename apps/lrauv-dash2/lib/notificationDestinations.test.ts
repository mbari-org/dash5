import {
  isValidEmail,
  normalizePhone,
  isValidPhone,
  isPhoneNumber,
} from './notificationDestinations'

describe('isValidEmail', () => {
  it('accepts a standard email address', () => {
    expect(isValidEmail('alerts@example.com')).toBe(true)
  })

  it('accepts an email with subdomains', () => {
    expect(isValidEmail('user@mail.mbari.org')).toBe(true)
  })

  it('rejects an address with no @', () => {
    expect(isValidEmail('notanemail')).toBe(false)
  })

  it('rejects an address with no domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects a bare phone number', () => {
    expect(isValidEmail('+15551234567')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true)
  })
})

describe('normalizePhone', () => {
  it('strips spaces', () => {
    expect(normalizePhone('+1 555 123 4567')).toBe('+15551234567')
  })

  it('strips dashes', () => {
    expect(normalizePhone('+1-555-123-4567')).toBe('+15551234567')
  })

  it('strips parentheses and dots', () => {
    expect(normalizePhone('+1 (555) 123.4567')).toBe('+15551234567')
  })

  it('leaves a clean E.164 number unchanged', () => {
    expect(normalizePhone('+15551234567')).toBe('+15551234567')
  })
})

describe('isValidPhone', () => {
  it('accepts a valid US number with spaces', () => {
    expect(isValidPhone('+1 555 123 4567')).toBe(true)
  })

  it('accepts a valid E.164 number without spaces', () => {
    expect(isValidPhone('+15551234567')).toBe(true)
  })

  it('accepts a valid international number', () => {
    expect(isValidPhone('+44 20 7946 0958')).toBe(true)
  })

  it('rejects a number with no leading +', () => {
    expect(isValidPhone('15551234567')).toBe(false)
  })

  it('rejects a number with a leading zero after +', () => {
    expect(isValidPhone('+05551234567')).toBe(false)
  })

  it('rejects a number that is too short (fewer than 7 digits total after +)', () => {
    expect(isValidPhone('+1123')).toBe(false)
  })

  it('rejects a number that is too long (more than 15 digits total after +)', () => {
    expect(isValidPhone('+1234567890123456')).toBe(false)
  })

  it('rejects an email address', () => {
    expect(isValidPhone('alerts@example.com')).toBe(false)
  })

  it('rejects an email whose local-part starts with +', () => {
    expect(isValidPhone('+user@example.com')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidPhone('  +15551234567  ')).toBe(true)
  })
})

describe('isPhoneNumber', () => {
  it('returns true for a valid phone number', () => {
    expect(isPhoneNumber('+15551234567')).toBe(true)
  })

  it('returns false for an email address', () => {
    expect(isPhoneNumber('alerts@example.com')).toBe(false)
  })

  it('returns false for an email whose local-part starts with +', () => {
    expect(isPhoneNumber('+user@example.com')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isPhoneNumber('')).toBe(false)
  })
})
