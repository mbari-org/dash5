import React from 'react'
import { VehicleProps } from '../Vehicle'

const frameClass = 'st32'

export interface ArgosBatteryIndicatorProps {
  colorArgo: VehicleProps['colorArgo']
  isDocked: boolean
}

/**
 * auvstatus LRAUV_svg.py: back/top st32, inner `{color_argo}` (st25 / st27 / st18).
 * No on-diagram text — color only (GH comment re text_argoago was incorrect).
 */
export const ArgosBatteryIndicator: React.FC<ArgosBatteryIndicatorProps> = ({
  colorArgo,
  isDocked,
}) => {
  const innerClass = isDocked ? 'st18' : colorArgo ?? 'st18'
  const decorativeOnly = innerClass === 'st18'

  const ariaLabel =
    isDocked || innerClass === 'st18'
      ? undefined
      : innerClass === 'st25'
      ? 'Argos battery OK'
      : innerClass === 'st27'
      ? 'Argos battery low'
      : 'Argos battery'

  const lowBattery = !isDocked && innerClass === 'st27'

  return (
    <g
      role={lowBattery ? 'alert' : undefined}
      aria-label={ariaLabel}
      aria-hidden={decorativeOnly ? true : undefined}
    >
      <rect
        data-testid="argos-battery frame"
        x="247.3"
        y="220"
        className={frameClass}
        width="5.4"
        height="9.4"
      />
      <rect x="248.7" y="219" className={frameClass} width="2.4" height="1" />
      <rect
        data-testid="argos-battery fill"
        x="247.5"
        y="220"
        className={innerClass}
        width="5"
        height="9"
      />
    </g>
  )
}
