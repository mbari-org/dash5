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

  it('matches dashed filenames via run keyword', () => {
    expect(
      parseMissionPathFromCommand('run Long-Range/Default-profile.xml')
    ).toBe('Long-Range/Default-profile.xml')
  })

  it('matches dotted filenames via run keyword', () => {
    expect(parseMissionPathFromCommand('run mbari/mbari-echo-5.25.tl')).toBe(
      'mbari/mbari-echo-5.25.tl'
    )
  })

  it('fallback: extracts path without run/load keyword', () => {
    expect(
      parseMissionPathFromCommand('Science/circle_acoustic_contact.xml')
    ).toBe('Science/circle_acoustic_contact.xml')
  })

  it('fallback: extracts dashed path without keyword', () => {
    expect(parseMissionPathFromCommand('Long-Range/Default.xml')).toBe(
      'Long-Range/Default.xml'
    )
  })

  it('fallback: decodes %20 in path without keyword', () => {
    expect(parseMissionPathFromCommand('Science/foo%20bar.xml')).toBe(
      'Science/foo bar.xml'
    )
  })
})
