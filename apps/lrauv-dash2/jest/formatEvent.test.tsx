import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import formatEvent from '../lib/formatEvent'
import { GetEventsResponse } from '@mbari/api-client'

const DASH_URL = 'https://okeanids.mbari.org'

const baseEvent: Partial<GetEventsResponse> = {
  eventId: 99,
  vehicleName: 'triton',
  unixTime: 1746381284000,
  isoTime: '2026-05-04T10:34:44Z',
  component: 'GFScanner',
}

const renderEvent = (event: GetEventsResponse) => {
  const el = formatEvent(event, DASH_URL)
  const { container } = render(el)
  return container
}

describe('formatEvent', () => {
  describe('logImportant with multi-line text', () => {
    const multiLineText =
      'Ground fault detected\nmA:\nCHAN A0 (Batt): 0.041525\nCHAN A1 (24V): 0.125959'

    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'logImportant',
      name: 'GFScanner',
      text: multiLineText,
    } as GetEventsResponse

    it('renders the source name in bold', () => {
      renderEvent(event)
      expect(screen.getByText('[GFScanner]')).toBeInTheDocument()
    })

    it('renders each newline-separated line as a separate element', () => {
      renderEvent(event)
      expect(screen.getByText('Ground fault detected')).toBeInTheDocument()
      expect(screen.getByText('mA:')).toBeInTheDocument()
      expect(screen.getByText('CHAN A0 (Batt): 0.041525')).toBeInTheDocument()
      expect(screen.getByText('CHAN A1 (24V): 0.125959')).toBeInTheDocument()
    })

    it('renders each line in its own separate DOM element', () => {
      renderEvent(event)
      const lines = [
        'Ground fault detected',
        'mA:',
        'CHAN A0 (Batt): 0.041525',
        'CHAN A1 (24V): 0.125959',
      ]
      lines.forEach((line) => {
        // Each line must be its own node — not merged with adjacent text
        expect(screen.getByText(line)).toBeInTheDocument()
        expect(screen.getByText(line).tagName).toBe('SPAN')
      })
    })
  })

  describe('logImportant with MTMSN= in text', () => {
    const mtmsnText = 'Command acknowledged MTMSN=12345\nSecond line'

    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'logImportant',
      name: 'SBD',
      text: mtmsnText,
    } as GetEventsResponse

    it('renders each line separately inside the MTMSN styled wrapper', () => {
      renderEvent(event)
      expect(
        screen.getByText('Command acknowledged MTMSN=12345')
      ).toBeInTheDocument()
      expect(screen.getByText('Second line')).toBeInTheDocument()
    })

    it('applies the MTMSN style class to the wrapper span', () => {
      renderEvent(event)
      const firstLine = screen.getByText('Command acknowledged MTMSN=12345')
      expect(firstLine.parentElement?.tagName).toBe('SPAN')
    })
  })

  describe('logFault with multi-line text', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'logFault',
      name: 'SomeFault',
      text: 'Fault line one\nFault line two',
    } as GetEventsResponse

    it('renders each line of a logFault event separately', () => {
      renderEvent(event)
      expect(screen.getByText('Fault line one')).toBeInTheDocument()
      expect(screen.getByText('Fault line two')).toBeInTheDocument()
    })
  })

  describe('logCritical with multi-line text', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'logCritical',
      name: 'CriticalSource',
      text: 'Critical line one\nCritical line two',
    } as GetEventsResponse

    it('renders each line of a logCritical event separately', () => {
      renderEvent(event)
      expect(screen.getByText('Critical line one')).toBeInTheDocument()
      expect(screen.getByText('Critical line two')).toBeInTheDocument()
    })
  })

  describe('command event with newline in data', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'command',
      user: 'testuser',
      note: 'a note',
      data: 'line one\nline two',
    } as GetEventsResponse

    it('renders each newline-separated data line separately', () => {
      renderEvent(event)
      expect(screen.getByText('line one')).toBeInTheDocument()
      expect(screen.getByText('line two')).toBeInTheDocument()
    })
  })
})
