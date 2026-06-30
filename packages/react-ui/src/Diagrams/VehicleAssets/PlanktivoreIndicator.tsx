import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface PlanktivoreIndicatorProps {
  textLM?: VehicleProps['textLM']
  textHM?: VehicleProps['textHM']
  textRoiAgo?: VehicleProps['textRoiAgo']
  colorWhitebeam?: VehicleProps['colorWhitebeam']
  colorWhiteled?: VehicleProps['colorWhiteled']
  colorRedbeam?: VehicleProps['colorRedbeam']
  colorRedled?: VehicleProps['colorRedled']
}

/**
 * Planktivore payload housing + galene camera LED indicators.
 * Matches the "ahi=planktivore-specific shapes" + galene LED sections
 * from the Dash4 SVG template. Render order mirrors Dash4: LEDs first
 * so the body polygon paints over their inner base, leaving only the
 * protruding tips visible below the housing.
 */
export const PlanktivoreIndicator: React.FC<PlanktivoreIndicatorProps> = ({
  textLM,
  textHM,
  textRoiAgo,
  colorWhitebeam = 'st18',
  colorWhiteled = 'st18',
  colorRedbeam = 'st18',
  colorRedled = 'st18',
}) => {
  return (
    <>
      {/* Galene LEDs — rendered before body so the body polygon covers
          their inner housing, leaving only the protruding tips visible */}
      <path
        aria-label="white beam"
        className={colorWhitebeam}
        d="M569,270l-4.7,2.7,4.7,2.7c.8-2,.8-3.3,0-5.5Z"
      />
      <path
        aria-label="white led"
        className={colorWhiteled}
        d="M562.5,270.8h2.5c1,0,1.8.8,1.8,1.8h0c0,1-.8,1.8-1.8,1.8h-2.5v-3.5Z"
      />
      <path
        aria-label="red beam"
        className={colorRedbeam}
        d="M569,276l-4.7,2.7,4.7,2.7c.8-2,.8-3.3,0-5.5Z"
      />
      <path
        aria-label="red led"
        className={colorRedled}
        d="M562.5,276.8h2.5c1,0,1.8.8,1.8,1.8h0c0,1-.8,1.8-1.8,1.8h-2.5v-3.5Z"
      />

      {/* Planktivore body housing — paints on top of LED bases */}
      <polygon
        aria-label="planktivore body"
        className="stplankbody"
        points="527.6 256.5 564.8 256.5 569.6 251.5 581.3 251.5 590.3 261.4 581.3 271.1 569.6 271.1 564.8 266.1 527.6 266.1 527.6 256.5"
      />
      <circle
        aria-label="planktivore lens"
        className="stplanklens"
        cx="575.8"
        cy="261"
        r="3.1"
      />

      {/* CTD channel readings displayed on the housing */}
      {textLM && (
        <text
          aria-label="LM value"
          transform="matrix(1 0 0 1 532 254.5)"
          className="st9 st10"
        >
          LM:{textLM}
        </text>
      )}
      {textHM && (
        <text
          aria-label="HM value"
          transform="matrix(1 0 0 1 531 264.5)"
          className="st9 st10"
        >
          HM:{textHM}
        </text>
      )}
      {textRoiAgo && (
        <text
          aria-label="ROI time ago"
          transform="matrix(1 0 0 1 532 272.0)"
          className="st12 st9 st13"
        >
          {textRoiAgo}
        </text>
      )}
    </>
  )
}
