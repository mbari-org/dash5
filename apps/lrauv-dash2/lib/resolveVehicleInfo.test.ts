import { resolveVehicleInfo } from './resolveVehicleInfo'
import { GetVehicleInfoResponse } from '@mbari/api-client'

const validResponse = {
  not_found: false,
  text_nextcomm: 'in 2h',
  text_mission: 'CircleSample',
} as unknown as GetVehicleInfoResponse

test('returns the response when valid', () => {
  expect(resolveVehicleInfo(validResponse)).toBe(validResponse)
})

test('returns undefined when not_found is true', () => {
  expect(resolveVehicleInfo({ not_found: true })).toBeUndefined()
})

test('returns undefined when input is undefined', () => {
  expect(resolveVehicleInfo(undefined)).toBeUndefined()
})
