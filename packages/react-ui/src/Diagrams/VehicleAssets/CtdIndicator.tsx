import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface CtdIndicatorProps {
  colorCtd?: VehicleProps['colorCtd']
  textCtdStatus?: VehicleProps['textCtdStatus']
  isDocked?: boolean
}

export const CtdIndicator: React.FC<CtdIndicatorProps> = ({
  colorCtd,
  textCtdStatus,
  isDocked,
}) => {
  // Server sends "ON " or "OFF"; knob is centered (cx=547) when ON, left when OFF.
  // cx=547 is the horizontal center of the toggle rect (x=538, width=18).
  const normalizedStatus = textCtdStatus?.trim().toUpperCase()
  const isKnownStatus = normalizedStatus === 'ON' || normalizedStatus === 'OFF'
  const isOn = normalizedStatus === 'ON'
  const knobCx = isOn ? '547' : '541'

  // st18 is the server's "invisible / no data" sentinel class.
  // Dot + label hide when no valid colorCtd or docked.
  const isDotHidden = isDocked || !colorCtd || colorCtd === 'st18'
  // Toggle also requires a recognized status so a missing value doesn't
  // render the switch in a misleading default-OFF position.
  const isToggleHidden = isDotHidden || !isKnownStatus

  return (
    <>
      {/* Row 1: filled circle indicator + "CTD" label.
          The dot is also suppressed when isDotHidden so it doesn't float
          as an orphaned circle while no data is present. */}
      <circle
        aria-label="ctd dot"
        className={isDotHidden ? 'st18' : colorCtd}
        cx="542"
        cy="241"
        r="3.6"
      />
      <text
        transform="matrix(1 0 0 1 549.0 241)"
        dominantBaseline="central"
        className={clsx(isDotHidden ? 'st18' : 'st9 st10')}
      >
        CTD
      </text>

      {/* Row 2: toggle-switch rectangle + white circle knob + status text.
          Hidden when no colorCtd/docked, or status is absent/unrecognized. */}
      {!isToggleHidden && (
        <>
          <rect
            aria-label="ctd toggle background"
            x="538"
            y="250"
            className={colorCtd}
            width="18"
            height="11"
          />
          <circle
            aria-label="ctd toggle knob"
            cx={knobCx}
            cy="255.5"
            r="2.8"
            className="st3"
          />
          <text
            aria-label="ctd status"
            transform="matrix(1 0 0 1 558.0 258.0)"
            className="st9"
            style={{ fontSize: '7.5px' }}
          >
            {textCtdStatus}
          </text>
        </>
      )}
    </>
  )
}
