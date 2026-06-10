import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import formatEvent, {
  labelBoldForEventType,
  labelColorForEventType,
} from '../lib/formatEvent'
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

    it('applies the MTMSN style classes to the wrapper span', () => {
      renderEvent(event)
      const firstLine = screen.getByText('Command acknowledged MTMSN=12345')
      // styles.mtmsn = 'font-mono text-red-800'
      expect(firstLine.parentElement).toHaveClass('font-mono', 'text-red-800')
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

  describe('labelColorForEventType', () => {
    it('returns #c78204 for logFault', () => {
      const event = { ...baseEvent, eventType: 'logFault' } as GetEventsResponse
      expect(labelColorForEventType(event)).toBe('#c78204')
    })

    it('returns #0000ff for gpsFix', () => {
      const event = { ...baseEvent, eventType: 'gpsFix' } as GetEventsResponse
      expect(labelColorForEventType(event)).toBe('#0000ff')
    })

    it('returns undefined for run (description is colored by formatEvent, not the label)', () => {
      const event = { ...baseEvent, eventType: 'run' } as GetEventsResponse
      expect(labelColorForEventType(event)).toBeUndefined()
    })

    it('returns undefined for uncolored event types', () => {
      const event = {
        ...baseEvent,
        eventType: 'logImportant',
      } as GetEventsResponse
      expect(labelColorForEventType(event)).toBeUndefined()
    })
  })

  describe('labelBoldForEventType', () => {
    it('returns true for logFault', () => {
      const event = { ...baseEvent, eventType: 'logFault' } as GetEventsResponse
      expect(labelBoldForEventType(event)).toBe(true)
    })

    it('returns true for gpsFix', () => {
      const event = { ...baseEvent, eventType: 'gpsFix' } as GetEventsResponse
      expect(labelBoldForEventType(event)).toBe(true)
    })

    it('returns false for other event types', () => {
      const event = {
        ...baseEvent,
        eventType: 'logImportant',
      } as GetEventsResponse
      expect(labelBoldForEventType(event)).toBe(false)
    })
  })

  describe('gpsFix Google Maps link', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'gpsFix',
      fix: { latitude: 36.7974, longitude: -121.8498 },
    } as GetEventsResponse

    it('renders a Google Maps anchor with the correct href', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      expect(link).toBeInTheDocument()
      expect(link.href).toContain('google.com/maps?q=36.7974,-121.8498')
    })

    it('opens in a new tab with noopener noreferrer', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('displays the lat/lon as the link text', () => {
      render(formatEvent(event, DASH_URL))
      expect(screen.getByText('36.7974, -121.8498')).toBeInTheDocument()
    })
  })

  describe('logFault description color', () => {
    it('wraps the fault description in amber #c78204', () => {
      const event: GetEventsResponse = {
        ...baseEvent,
        eventType: 'logFault',
        name: 'BuoyancyServo',
        text: 'Buoyancy getPosition uart error',
      } as GetEventsResponse
      const { container } = render(formatEvent(event, DASH_URL))
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper).toHaveStyle({ color: '#c78204' })
    })

    it('scopes MTMSN= dark-red styling per-line, leaving other fault lines amber', () => {
      const event: GetEventsResponse = {
        ...baseEvent,
        eventType: 'logFault',
        name: 'BuoyancyServo',
        text: 'Buoyancy uart error\nMTMSN=12345',
      } as GetEventsResponse
      const { container } = render(formatEvent(event, DASH_URL))
      const faultLine = screen.getByText('Buoyancy uart error')
      const mtmsnLine = screen.getByText('MTMSN=12345')
      expect(faultLine).not.toHaveClass('text-red-800')
      expect(mtmsnLine).toHaveClass('text-red-800')
    })
  })

  describe('run (Mission Request) description color', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'run',
      user: 'testuser',
      note: 'test mission',
      data: 'speed=1.5;',
    } as GetEventsResponse

    it('wraps the run description in purple', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper).toHaveStyle({ color: 'purple' })
    })
  })

  describe('logImportant startedMission / defaultMission text-base styling', () => {
    it('renders startedMission text at text-base size', () => {
      const event: GetEventsResponse = {
        ...baseEvent,
        eventType: 'logImportant',
        text: 'Started mission Sci2000.xml',
      } as GetEventsResponse
      const { container } = render(formatEvent(event, DASH_URL))
      const p = container.querySelector('p') as HTMLElement
      expect(p).toHaveClass('text-base')
    })

    it('renders defaultMission text at text-base size', () => {
      const event: GetEventsResponse = {
        ...baseEvent,
        eventType: 'logImportant',
        text: 'Default mission has been running for 2 hours',
      } as GetEventsResponse
      const { container } = render(formatEvent(event, DASH_URL))
      const p = container.querySelector('p') as HTMLElement
      expect(p).toHaveClass('text-base')
    })

    it('does not apply text-base to a plain logImportant event', () => {
      const event: GetEventsResponse = {
        ...baseEvent,
        eventType: 'logImportant',
        name: 'GFScanner',
        text: 'Some other important message',
      } as GetEventsResponse
      const { container } = render(formatEvent(event, DASH_URL))
      const p = container.querySelector('p') as HTMLElement
      expect(p).not.toHaveClass('text-base')
    })
  })

  describe('dataProcessed URL', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'dataProcessed',
      path: '2022/202207/20220712T221014',
    } as GetEventsResponse

    it('includes /data/ in the href', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      expect(link.href).toContain('/data/triton/realtime/sbdlogs/')
    })

    it('does not omit /data/ (old bug produced .../TethysDash/triton/... without /data/)', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      // Old URL was: ${dashUrl}/triton/realtime/... (no /data/ after the base)
      expect(link.href).not.toMatch(new RegExp(`${DASH_URL}/triton/`))
    })
  })

  describe('logPath event', () => {
    const LOG_PATH = '2022/202207/20220712T221014'
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'logPath',
      path: LOG_PATH,
    } as GetEventsResponse

    it('includes /data/ in the directory href', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const links = container.querySelectorAll('a')
      const dirLink = Array.from(links).find((a) => a.textContent === LOG_PATH)
      expect(dirLink).toBeDefined()
      expect(dirLink!.href).toContain('/data/triton/realtime/sbdlogs/')
    })

    it('the path link opens in a new tab', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('sbdReceive URL with path', () => {
    const event: GetEventsResponse = {
      ...baseEvent,
      eventType: 'sbdReceive',
      state: 2,
      dataLen: 840,
      path: '2022/202207/20220712T221014/Express0196.lzma',
      momsn: 1234 as unknown as string,
    } as GetEventsResponse

    it('includes /data/ in the file href', () => {
      const { container } = render(formatEvent(event, DASH_URL))
      const link = container.querySelector('a') as HTMLAnchorElement
      expect(link).toBeInTheDocument()
      expect(link.href).toContain('/data/triton/realtime/sbdlogs/')
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
