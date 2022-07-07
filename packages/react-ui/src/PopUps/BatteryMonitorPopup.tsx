import React, { useState } from 'react'
import clsx from 'clsx'
import { Modal } from '../Modal'
// import chart from '../assets/stand-in-chart.png'
import { Table } from '../Data/Table'
import { IconButton } from '../Navigation'
import {
  faExternalLink,
  faInfoCircle,
} from '@fortawesome/pro-regular-svg-icons'

export interface BatteryMonitorPopupProps {
  className?: string
  style?: React.CSSProperties
  open?: boolean
  batteryPercent: number
  batteryRemaining: Estimate
  missionRemaining: Estimate
  suggestions: Suggestion[]
  onClose?: () => void
}

interface Estimate {
  hours: number
  miles: number
}

interface Suggestion {
  headline: string
  important?: boolean
  description: string
  improvement: string
  onExternalInfoClick?: () => void // If this is present the purple arrow icon next to the headline should render.
}

export const BatteryMonitorPopup: React.FC<BatteryMonitorPopupProps> = ({
  className,
  style,
  open = false,
  batteryPercent,
  batteryRemaining,
  missionRemaining,
  suggestions,
  onClose,
}) => {
  const Row = (suggestion: Suggestion) => {
    const [expanded, setExpanded] = useState(false)
    const {
      headline,
      important,
      description,
      improvement,
      onExternalInfoClick,
    } = suggestion

    return {
      cells: [
        {
          label: (
            <div>
              <span className={clsx('text-black', important && 'font-medium')}>
                {headline}
              </span>
              {onExternalInfoClick && (
                <IconButton
                  icon={faExternalLink}
                  ariaLabel="external info button"
                  className="text-indigo-600"
                  onClick={onExternalInfoClick}
                />
              )}
            </div>
          ),
          secondary: expanded ? (
            <span className="relative top-2 opacity-60">{description}</span>
          ) : undefined,
          highlighted: true,
        },
        {
          label: (
            <div className="flex items-center">
              <span>+{improvement}</span>
              <span className="flex w-full justify-end">
                <IconButton
                  icon={faInfoCircle}
                  ariaLabel="more info button"
                  onClick={() => setExpanded(!expanded)}
                />
              </span>
            </div>
          ),
          highlighted: true,
          highlightedStyle: 'opacity-60',
        },
      ],
    }
  }

  const suggestionRows = suggestions?.length
    ? suggestions.map((suggestion) => Row(suggestion))
    : [
        Row({
          headline: 'No current suggestions',
          improvement: '0',
          description: 'No current suggestions',
        }),
      ]

  return (
    <Modal
      grayHeader
      fullWidthBody
      onClose={onClose}
      title={
        <ul>
          <li className="mb-2">Battery monitor: {batteryPercent}%</li>
          <li className=" opacity-60">
            Battery remaining: {batteryRemaining.hours}{' '}
            {batteryRemaining.hours === 1 ? 'hour' : 'hours'} (~
            {batteryRemaining.miles}mi)
          </li>
          <li className="mb-4 opacity-60">
            Mission remaining: {missionRemaining.hours}{' '}
            {missionRemaining.hours === 1 ? 'hour' : 'hours'} (~
            {missionRemaining.miles}mi)
          </li>
        </ul>
      }
      className={clsx('', className)}
      style={style}
      open={open}
    >
      <section>
        {/* eslint-disable-next-line -- remove this image tag, associated image asset, and mocked asset in test when actual chart component is implemented */}
        {/* <img src={chart} alt="chart to be replaced" /> */}
      </section>
      <section>
        <Table
          grayHeader
          noBorder
          scrollable
          className="border-t-2 border-solid border-stone-200"
          header={{
            cells: [
              { label: <span className="opacity-60">SUGGESTION</span> },
              { label: <span className="opacity-60">BATTERY LIFE</span> },
            ],
          }}
          rows={suggestionRows}
        />
      </section>
    </Modal>
  )
}

BatteryMonitorPopup.displayName = 'Popups.BatteryMonitorPopup'
