import React from 'react'
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
  // When docked, all three nose dots (CTD, UBAT, flow) render white (st3).
  // When deployed, visibility/color is server-driven: st18 = hidden, any other
  // class = that status color. The "CTD" text label is hidden when docked.
  const isDotHidden = !isDocked && (colorCtd == null || colorCtd === 'st18')
  const isCameraHidden = colorCameraBody == null || colorCameraBody === 'st18'

  return (
    <>
      {/* CTD status dot — always rendered; class from server controls visibility/color. */}
      <circle
        aria-label="ctd dot"
        className={isDotHidden ? 'st18' : isDocked ? 'st3' : colorCtd}
        cx="544"
        cy="241"
        r="4"
      />
      {!isDocked && (
        <text transform="matrix(1 0 0 1 551 244)" className="st9 st10">
          CTD
        </text>
      )}

      {/* Camera indicator — body rectangle + lens circle + channel dots.
          Matches Dash4 galene section: color_camerabody drives the body rect,
          color_cameralens drives the lens circle, color_cam1/cam2 are
          small channel indicator dots to the right of the body. */}
      {!isCameraHidden && (
        <>
          <rect
            aria-label="camera body"
            x="540"
            y="250"
            className={colorCameraBody}
            width="16"
            height="10"
          />
          <circle
            aria-label="camera lens"
            cx="548"
            cy="255"
            r="3"
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
