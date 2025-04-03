import { extractPicAndOnCallFromNotes } from './extractPicAndOnCallFromNotes'
import { GetEventsResponse } from '../Event/getEvents'

describe('extractPicAndOnCallFromNotes', () => {
  it('should return null for both pic and onCall when no events are provided', () => {
    const result = extractPicAndOnCallFromNotes([])
    expect(result).toEqual({ pic: null, onCall: null })
  })

  it('should correctly extract PIC and On-Call information from note events', () => {
    const noteEvents: GetEventsResponse[] = [
      {
        eventId: 1,
        vehicleName: 'vehicle1',
        unixTime: 1000,
        isoTime: '2023-01-01T00:00:01.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as PIC',
      },
      {
        eventId: 2,
        vehicleName: 'vehicle1',
        unixTime: 2000,
        isoTime: '2023-01-01T00:00:02.000Z',
        eventType: 'note',
        user: 'Jane',
        note: 'Signing in as On-Call',
      },
      {
        eventId: 3,
        vehicleName: 'vehicle1',
        unixTime: 3000,
        isoTime: '2023-01-01T00:00:03.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing off as PIC',
      },
      {
        eventId: 4,
        vehicleName: 'vehicle1',
        unixTime: 4000,
        isoTime: '2023-01-01T00:00:04.000Z',
        eventType: 'note',
        user: 'Bob',
        note: 'Signing in as PIC',
      },
    ]

    const result = extractPicAndOnCallFromNotes(noteEvents)

    expect(result.pic).toEqual({
      user: 'Bob',
      unixTime: 4000,
    })
    expect(result.onCall).toEqual({
      user: 'Jane',
      unixTime: 2000,
    })
  })

  it('should handle events with missing user information', () => {
    const noteEvents: GetEventsResponse[] = [
      {
        eventId: 1,
        vehicleName: 'vehicle1',
        unixTime: 1000,
        isoTime: '2023-01-01T00:00:01.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as PIC',
      },
      {
        eventId: 2,
        vehicleName: 'vehicle1',
        unixTime: 2000,
        isoTime: '2023-01-01T00:00:02.000Z',
        eventType: 'note',
        user: undefined,
        note: 'Signing in as On-Call',
      },
      {
        eventId: 3,
        vehicleName: 'vehicle1',
        unixTime: 3000,
        isoTime: '2023-01-01T00:00:03.000Z',
        eventType: 'note',
        user: 'Jane',
        note: 'Signing in as On-Call',
      },
    ]

    const result = extractPicAndOnCallFromNotes(noteEvents)

    expect(result.pic).toEqual({
      user: 'John',
      unixTime: 1000,
    })
    expect(result.onCall).toEqual({
      user: 'Jane',
      unixTime: 3000,
    })
  })

  it('should handle events with non-matching notes', () => {
    const noteEvents: GetEventsResponse[] = [
      {
        eventId: 1,
        vehicleName: 'vehicle1',
        unixTime: 1000,
        isoTime: '2023-01-01T00:00:01.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Some other note',
      },
      {
        eventId: 2,
        vehicleName: 'vehicle1',
        unixTime: 2000,
        isoTime: '2023-01-01T00:00:02.000Z',
        eventType: 'note',
        user: 'Jane',
        note: 'Another note',
      },
    ]

    const result = extractPicAndOnCallFromNotes(noteEvents)

    expect(result.pic).toBeNull()
    expect(result.onCall).toBeNull()
  })

  it('should handle multiple sign-ins and sign-offs for the same user', () => {
    const noteEvents: GetEventsResponse[] = [
      {
        eventId: 1,
        vehicleName: 'vehicle1',
        unixTime: 1000,
        isoTime: '2023-01-01T00:00:01.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as PIC',
      },
      {
        eventId: 2,
        vehicleName: 'vehicle1',
        unixTime: 2000,
        isoTime: '2023-01-01T00:00:02.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing off as PIC',
      },
      {
        eventId: 3,
        vehicleName: 'vehicle1',
        unixTime: 3000,
        isoTime: '2023-01-01T00:00:03.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as PIC',
      },
      {
        eventId: 4,
        vehicleName: 'vehicle1',
        unixTime: 4000,
        isoTime: '2023-01-01T00:00:04.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as On-Call',
      },
      {
        eventId: 5,
        vehicleName: 'vehicle1',
        unixTime: 5000,
        isoTime: '2023-01-01T00:00:05.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing off as On-Call',
      },
    ]

    const result = extractPicAndOnCallFromNotes(noteEvents)

    expect(result.pic).toEqual({
      user: 'John',
      unixTime: 3000,
    })
    expect(result.onCall).toBeNull()
  })

  it('should handle case-insensitive role names', () => {
    const noteEvents: GetEventsResponse[] = [
      {
        eventId: 1,
        vehicleName: 'vehicle1',
        unixTime: 1000,
        isoTime: '2023-01-01T00:00:01.000Z',
        eventType: 'note',
        user: 'John',
        note: 'Signing in as pic',
      },
      {
        eventId: 2,
        vehicleName: 'vehicle1',
        unixTime: 2000,
        isoTime: '2023-01-01T00:00:02.000Z',
        eventType: 'note',
        user: 'Jane',
        note: 'Signing in as ON-CALL',
      },
    ]

    const result = extractPicAndOnCallFromNotes(noteEvents)

    expect(result.pic).toEqual({
      user: 'John',
      unixTime: 1000,
    })
    expect(result.onCall).toEqual({
      user: 'Jane',
      unixTime: 2000,
    })
  })
})
