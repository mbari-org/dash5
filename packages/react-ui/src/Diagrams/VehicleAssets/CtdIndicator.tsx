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
  // The server always sends color_ctd when CTD data is available:
  //   colorCtd = some green class (e.g. 'st4') → CTD ON
  //   colorCtd = 'st18'                        → CTD OFF (invisible dot, gray toggle)
  //   colorCtd = undefined                     → no CTD data at all → hide everything
  // We drive ON/OFF from colorCtd so the toggle shows even when textCtdStatus
  // is absent (server may not send text_cameraago when CTD is OFF).
  const isOn = colorCtd != null && colorCtd !== 'st18'
  // cx=547 is the horizontal center of the toggle rect (x=538, width=18).
  const knobCx = isOn ? '547' : '541'

  // Dot + "CTD" label: visible only when CTD is ON (green dot) and not docked.
  const isDotHidden = isDocked || !isOn
  // Toggle: visible whenever the server has sent color_ctd (even st18 = OFF) and not docked.
  const isToggleHidden = isDocked || colorCtd == null
  // Rectangle is green when ON, dark gray (st12, #606060) when OFF.
  const toggleBgClass = isOn ? colorCtd : 'st12'

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
            className={toggleBgClass}
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
