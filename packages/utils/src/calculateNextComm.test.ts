import '@testing-library/jest-dom'
import { DateTime } from 'luxon'
import {
  calculateRelativeNextComm,
  calculateNextCommMs,
} from './calculateNextComm'

describe('calculateNextCommMs', () => {
  it('returns null when no comm reference time is available', () => {
    expect(calculateNextCommMs(null, null, 10)).toBeNull()
    expect(calculateNextCommMs(undefined, undefined, 10)).toBeNull()
    expect(calculateNextCommMs(0, 0, 10)).toBeNull()
  })

  it('uses the max of satcomms and cellcomms times as reference', () => {
    const sat = 1_000_000
    const cell = 2_000_000
    const result = calculateNextCommMs(sat, cell, 10)
    expect(result).toBe(cell + 10 * 60 * 1000)
  })

  it('defaults to 60 minutes when needCommsMinutes is missing or non-positive', () => {
    const ref = 5_000
    expect(calculateNextCommMs(ref, null, null)).toBe(ref + 60 * 60 * 1000)
    expect(calculateNextCommMs(ref, null, undefined)).toBe(ref + 60 * 60 * 1000)
    expect(calculateNextCommMs(ref, null, 0)).toBe(ref + 60 * 60 * 1000)
    expect(calculateNextCommMs(ref, null, -5)).toBe(ref + 60 * 60 * 1000)
  })
})

describe('calculateNextComm', () => {
  it('returns nulls when no reference time', () => {
    const res = calculateRelativeNextComm(null, null, null, Date.now())
    expect(res.nextCommTimeMs).toBeNull()
    expect(res.text).toBeNull()
  })

  it('returns next comm time and formatted text', () => {
    const ref = 10_000
    const need = 30 // minutes
    const expectedNext = ref + need * 60 * 1000
    const now = ref // so delta is +30m
    const res = calculateRelativeNextComm(ref, null, need, now)
    expect(res.nextCommTimeMs).toBe(expectedNext)
    const expectedTime = DateTime.fromMillis(expectedNext).toFormat('hh:mm')
    expect(res.text).toBe(`${expectedTime} - in 30m`)
  })
})
