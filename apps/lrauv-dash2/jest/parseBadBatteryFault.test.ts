import { parseBadBatteryFault } from '../lib/parseBadBatteryFault'

describe('parseBadBatteryFault', () => {
  it('returns hidden when there are no BPC1 faults', () => {
    expect(
      parseBadBatteryFault([
        { name: 'DVL_Micro', text: 'failed', unixTime: 1_700_000_000_000 },
      ])
    ).toEqual({ show: false, text: '' })
  })

  it('shows BAD BATT from a Battery stick fault', () => {
    expect(
      parseBadBatteryFault([
        {
          name: 'BPC1',
          text: 'Battery stick 3 failed',
          unixTime: 1_700_000_000_000,
        },
      ])
    ).toEqual({ show: true, text: '' })
  })

  it('shows stick count from Failed to receive data', () => {
    expect(
      parseBadBatteryFault([
        {
          name: 'BPC1',
          text: 'Failed to receive data from 12 sticks prior to timeout. Missing stick IDs are: 21, 22. [BPC1]',
          unixTime: 1_700_000_000_000,
        },
      ])
    ).toEqual({ show: true, text: '12x' })
  })

  it('uses the most recent stick-count report', () => {
    expect(
      parseBadBatteryFault([
        {
          name: 'BPC1',
          text: 'Failed to receive data from 6 sticks prior to timeout.',
          unixTime: 1_700_000_000_000,
        },
        {
          name: 'BPC1',
          text: 'Failed to receive data from 12 sticks prior to timeout.',
          unixTime: 1_700_000_100_000,
        },
      ])
    ).toEqual({ show: true, text: '12x' })
  })
})
