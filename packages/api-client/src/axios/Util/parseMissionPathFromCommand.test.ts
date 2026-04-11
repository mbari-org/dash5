import { parseMissionPathFromCommand } from './parseMissionPathFromCommand'

describe('parseMissionPathFromCommand', () => {
  it('returns path from run command', () => {
    expect(
      parseMissionPathFromCommand('run Maintenance/tank_ballast_and_trim.xml')
    ).toBe('Maintenance/tank_ballast_and_trim.xml')
  })

  it('returns first path from load command', () => {
    expect(
      parseMissionPathFromCommand(
        'load Science/circle_acoustic_contact.xml;set foo 1 count;run '
      )
    ).toBe('Science/circle_acoustic_contact.xml')
  })

  it('decodes %20 so paths with spaces match', () => {
    expect(parseMissionPathFromCommand('run Science/foo%20bar.xml')).toBe(
      'Science/foo bar.xml'
    )
  })

  it('returns undefined when no path', () => {
    expect(parseMissionPathFromCommand('set foo 1 count')).toBeUndefined()
  })
})
