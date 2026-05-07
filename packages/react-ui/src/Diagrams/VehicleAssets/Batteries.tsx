import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface BatteryProps {
  colorBat1?: VehicleProps['colorBat1']
  colorBat2?: VehicleProps['colorBat2']
  colorBat3?: VehicleProps['colorBat3']
  colorBat4?: VehicleProps['colorBat4']
  colorBat5?: VehicleProps['colorBat5']
  colorBat6?: VehicleProps['colorBat6']
  colorBat7?: VehicleProps['colorBat7']
  colorBat8?: VehicleProps['colorBat8']
  textVolts?: VehicleProps['textVolts']
  textAmps?: VehicleProps['textAmps']
  textAmpAgo?: VehicleProps['textAmpAgo']
  colorVolts?: VehicleProps['colorVolts']
  colorAmps?: VehicleProps['colorAmps']
  colorVoltThresh?: VehicleProps['colorVoltThresh']
  textVoltThresh?: VehicleProps['textVoltThresh']
  colorAmpThresh?: VehicleProps['colorAmpThresh']
  textAmpThresh?: VehicleProps['textAmpThresh']
  textBatteryDuration?: VehicleProps['textBatteryDuration']
  textBatteryUnits?: VehicleProps['textBatteryUnits']
  textCurrent?: VehicleProps['textCurrent']
  svgCurrent?: VehicleProps['svgCurrent']
  colorDuration?: VehicleProps['colorDuration']
  isDocked?: boolean
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void
}
export const Batteries: React.FC<BatteryProps> = ({
  colorBat1,
  colorBat2,
  colorBat3,
  colorBat4,
  colorBat5,
  colorBat6,
  colorBat7,
  colorBat8,
  isDocked,
  textVolts,
  textAmps,
  textAmpAgo,
  colorVolts,
  colorAmps,
  colorVoltThresh,
  textVoltThresh,
  colorAmpThresh,
  textAmpThresh,
  textBatteryDuration,
  textBatteryUnits,
  textCurrent,
  svgCurrent,
  colorDuration,
  onClick: handleClick,
}) => {
  return (
    <g>
      <title>Batteries in 0.5 increment from 13.5 to 16.5</title>
      <circle
        aria-label="bat1"
        className={colorBat1}
        cx="309"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat2"
        className={colorBat2}
        cx="319"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat3"
        className={colorBat3}
        cx="329"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat4"
        className={colorBat4}
        cx="339"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat5"
        className={colorBat5}
        cx="349"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat6"
        className={colorBat6}
        cx="359"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat7"
        className={colorBat7}
        cx="369"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat8"
        className={colorBat8}
        cx="379"
        cy="241.38"
        r="4"
      />
      <rect
        aria-label="amps"
        x="336.28"
        y="261.76"
        className={colorAmps}
        width="25.5"
        height="10.5"
      />
      <rect
        aria-label="volts"
        x="336.28"
        y="249.85"
        className={colorVolts}
        width="25.5"
        height="10.5"
      />
      <text
        aria-label="text_volts"
        transform="matrix(1 0 0 1 338.0 257.9931)"
        className="st9 st10"
      >
        {textVolts}
      </text>
      <text
        aria-label="text_amps"
        transform="matrix(1 0 0 1 338.0 270.4917)"
        className="st9 st10"
      >
        {textAmps}
      </text>
      <text
        aria-label="text_ampago"
        transform="matrix(1 0 0 1 330.0 280.0)"
        className="st12 st9 st13"
      >
        {textAmpAgo}
      </text>
      {/* Voltage threshold label */}
      <text
        transform="matrix(1 0 0 1 310.64 258.2642)"
        className={clsx(isDocked ? 'st18' : 'st9')}
        style={{ fontSize: '9.4px' }}
      >
        Volts:
      </text>
      {textVoltThresh && (
        <text
          aria-label="text_voltthresh"
          transform="matrix(1 0 0 1 291.5 258.0)"
          className="st9"
          style={{ fontSize: '7.5px' }}
        >
          {textVoltThresh}
        </text>
      )}

      {/* Amp threshold label */}
      <text
        transform="matrix(1 0 0 1 304.7791 270.4165)"
        className={clsx(isDocked ? 'st18' : 'st9')}
        style={{ fontSize: '9.4px' }}
      >
        AmpH:
      </text>
      {textAmpThresh && (
        <text
          aria-label="text_ampthresh"
          transform="matrix(1 0 0 1 293.5 270.0)"
          className="st9"
          style={{ fontSize: '7.5px' }}
        >
          {textAmpThresh}
        </text>
      )}

      {/* Battery duration / current draw — server-provided bar + text labels */}
      {(textBatteryDuration != null || textCurrent != null) && (
        <>
          {/* Outer frame around the bar + labels */}
          {/* Server-provided colored bar (svg_current) sized to current draw */}
          {svgCurrent && <g dangerouslySetInnerHTML={{ __html: svgCurrent }} />}
          {/* Dark border framing the bar — spans all 4 text rows */}
          <rect
            aria-label="battery bar border"
            x="364.5"
            y="249.5"
            width="6"
            height="27"
            className="st1"
            fill="none"
          />
          {textBatteryDuration != null && (
            <text
              aria-label="text_batteryduration"
              transform="matrix(1 0 0 1 372.0 254.5)"
              className={clsx('st9 st13', colorDuration ?? 'st12')}
            >
              {textBatteryDuration}
            </text>
          )}
          {textBatteryUnits && (
            <text
              aria-label="text_batteryunits"
              transform="matrix(1 0 0 1 372.0 261.0)"
              className={clsx('st9 st13', colorDuration ?? 'st12')}
            >
              {textBatteryUnits}
            </text>
          )}
          {textCurrent != null && (
            <text
              aria-label="text_current"
              transform="matrix(1 0 0 1 372.0 267.5)"
              className="st12 st9 st13"
            >
              {textCurrent}
            </text>
          )}
          {textCurrent != null && (
            <text
              aria-label="text_current_units"
              transform="matrix(1 0 0 1 372.0 274.0)"
              className="st12 st9 st13"
            >
              amps
            </text>
          )}
        </>
      )}

      <rect
        x="300"
        y="234"
        className="cursor-pointer fill-stone-500/0 transition-colors duration-100 hover:fill-stone-500/20"
        width="87"
        height="50"
        rx="5"
        onClick={handleClick}
      />
    </g>
  )
}
