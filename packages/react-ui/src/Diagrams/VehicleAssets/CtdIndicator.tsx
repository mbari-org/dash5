import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface CtdIndicatorProps {
  colorCtd?: VehicleProps['colorCtd']
  colorCameraBody?: VehicleProps['colorCameraBody']
  colorCameraLens?: VehicleProps['colorCameraLens']
  colorCam1?: VehicleProps['colorCam1']
  colorCam2?: VehicleProps['colorCam2']
  isDocked?: boolean
}

export const CtdIndicator: React.FC<CtdIndicatorProps> = ({
  colorCtd,
  colorCameraBody,
  colorCameraLens,
  colorCam1,
  colorCam2,
  isDocked,
}) => {
  // CTD dot: visible when color_ctd is a real color (not st18 = no data) and not docked.
  const hasCtdData = colorCtd != null && colorCtd !== 'st18'
  const isDotHidden = isDocked || !hasCtdData

  // Camera body: visible when color_camerabody is set and not docked.
  // The camera icon = gray rectangle (body) + colored circle (lens).
  const hasCameraData = colorCameraBody != null && colorCameraBody !== 'st18'
  const isCameraHidden = isDocked || !hasCameraData

  return (
    <>
      {/* Row 1: CTD status dot + "CTD" label */}
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

      {/* Row 2: Camera indicator — body rectangle + lens circle + channel dots.
          Matches Dash4: color_camerabody drives the body rect,
          color_cameralens drives the lens circle, color_cam1/cam2 are
          small channel indicator dots to the right of the body. */}
      {!isCameraHidden && (
        <>
          <rect
            aria-label="camera body"
            x="538"
            y="250"
            className={colorCameraBody}
            width="18"
            height="11"
          />
          <circle
            aria-label="camera lens"
            cx="547"
            cy="255.5"
            r="2.8"
            className={colorCameraLens ?? 'st3'}
          />
          <circle
            aria-label="camera channel 1"
            cx="559"
            cy="252"
            r="1.5"
            className={colorCam1 ?? 'st18'}
          />
          <circle
            aria-label="camera channel 2"
            cx="559"
            cy="258"
            r="1.5"
            className={colorCam2 ?? 'st18'}
          />
        </>
      )}
    </>
  )
}
