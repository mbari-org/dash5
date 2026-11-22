import React from 'react'
import { VehicleProps } from '../Vehicle'

const frameClass = 'st32'

export interface ArgosBatteryIndicatorProps {
  colorArgo: VehicleProps['colorArgo']
  textArgoAgo?: VehicleProps['textArgoAgo']
}

/**
 * auvstatus LRAUV_svg.py: back/top st32, inner `{color_argo}` (st25 / st27 / st18).
 * `text_argoago` is the Dash4 "Last good: …" line at (258, 227).
 * Always respects color_argo from the server regardless of dock/recovery state.
 */
export const ArgosBatteryIndicator: React.FC<ArgosBatteryIndicatorProps> = ({
  colorArgo,
  textArgoAgo,
}) => {
  const innerClass = colorArgo ?? 'st18'
  const decorativeOnly = innerClass === 'st18' && !textArgoAgo

  const ariaLabel =
    innerClass === 'st18'
      ? undefined
      : innerClass === 'st25'
      ? 'Argos battery OK'
      : innerClass === 'st27'
      ? 'Argos battery low'
      : 'Argos battery'

  const lowBattery = innerClass === 'st27'

  return (
    <g>
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
      {textArgoAgo && (
        <text
          aria-label="argos ago"
          transform="matrix(1 0 0 1 258 227)"
          className="st12 st9 st13"
        >
          {textArgoAgo}
        </text>
      )}
    </g>
  )
}
