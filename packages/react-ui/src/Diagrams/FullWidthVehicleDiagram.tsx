import React, { useRef } from 'react'
import clsx from 'clsx'
import { DropWeightIndicator } from './VehicleAssets/DropWeightIndicator'
import { DvlIndicator } from './VehicleAssets/DvlIndicator'
import { ChargingCable } from './VehicleAssets/ChargingCable'
import { AuvBody } from './VehicleAssets/AuvBody'
import { Thruster } from './VehicleAssets/Thruster'
import { GroundFault } from './VehicleAssets/GroundFault'
import { Batteries, BatteryProps } from './VehicleAssets/Batteries'
import { Comms } from './VehicleAssets/Comms'
import { Gps } from './VehicleAssets/Gps'
import { VehicleInfo } from './VehicleAssets/VehicleInfo'
import { Cart } from './VehicleAssets/Cart'
import { ErrorLabel } from './VehicleAssets/ErrorLabel'
import { Note } from './VehicleAssets/Note'
import { VehicleProps } from './Vehicle'
import { useResizeObserver } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { Leak } from './VehicleAssets/Leak'

export interface FullWidthVehicleDiagramProps extends VehicleProps {
  vehicleWidth?: number
  vehicleHeight?: number
  onBatteryClick?: BatteryProps['onClick']
}

export const FullWidthVehicleDiagram: React.FC<
  FullWidthVehicleDiagramProps
> = ({
  className,
  style,
  status,
  textVehicle,
  textLastUpdate,
  textArrow,
  textThrustTime,
  textReckonDistance,
  colorDvl = 'st3',
  textDvlStatus,
  textGps,
  colorGps = 'st3',
  textGpsAgo,
  textSat,
  textCommAgo,
  colorSatComm = 'st3',
  textCell,
  textCellAgo,
  colorCell = 'st3',
  colorDirtbox = 'st18',
  colorWavecolor = 'st18',
  colorSmallCable = 'st18',
  colorBigCable = 'st18',
  textDroptime,
  colorDrop = 'st3',
  colorGf = 'st3',
  textGf,
  textGfTime,
  textSpeed,
  colorHw = 'st3',
  colorSw = 'st3',
  colorOt = 'st3',
  colorThrust = 'st3',
  colorBat1 = 'st3',
  colorBat2 = 'st3',
  colorBat3 = 'st3',
  colorBat4 = 'st3',
  colorBat5 = 'st3',
  colorBat6 = 'st3',
  colorBat7 = 'st3',
  colorBat8 = 'st3',
  colorLeak = 'st18',
  textLeak,
  textLeakAgo,
  textVolts,
  textAmps,
  textAmpAgo,
  colorVolts = 'st3',
  colorAmps = 'st3',
  colorCart = 'st18',
  colorCartCircle = 'st18',
  textArriveLabel = 'Arrive Station',
  textArriveStation,
  textCurrentDist,
  textStationDist,
  textCriticalError,
  textCriticalTime,
  textNote,
  textNoteTime,
  vehicleWidth = 800,
  vehicleHeight = 300,
  onBatteryClick: handleBatteryClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { size: containerSize } = useResizeObserver({ element: containerRef })

  const isDocked = status === 'pluggedIn' || status === 'recovered'

  const xOffset = (containerSize.width - vehicleWidth) / 2
  const yOffset = (containerSize.height - vehicleHeight) / 2

  const waveHeight = containerSize?.height * 0.8
  const waveOffset = containerSize?.height * 0.2
  const waveWidth = containerSize.width
  const numberOfWaves = Math.floor(containerSize.width / 100)
  const wavePath = `M0,${waveOffset} ${new Array(numberOfWaves)
    .fill(null)
    .reduce((a, _, i) => {
      const start = 0 //(waveWidth / numberOfWaves) * i
      const end = waveWidth / numberOfWaves // * (i + 1)
      const curveHeight = i < 1 ? 20 : 30
      return `${a} c${start},${curveHeight} ${end},${curveHeight + 20} ${end},0`
    }, '')} l0,${waveHeight} l${-waveWidth},${waveHeight} Z`

  const upArrow = String.fromCharCode(8593)

  return (
    <div
      className={clsx('relative h-full w-full overflow-hidden p-0', className)}
      style={style}
      aria-label="vehicle diagram"
      ref={containerRef}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        viewBox="128 155 510 162.5"
        xmlSpace="preserve"
        className="absolute top-0 left-0 z-10"
        style={{
          top: yOffset,
          left: xOffset,
          width: vehicleWidth,
          height: vehicleHeight,
        }}
      >
        <g>
          <ChargingCable
            colorSmallCable={colorSmallCable}
            colorBigCable={colorBigCable}
            isFullWidthDiagram
          />

          <AuvBody />

          <DropWeightIndicator
            textDroptime={textDroptime}
            colorDrop={colorDrop}
            isDocked={isDocked}
          />

          <GroundFault
            textGf={textGf}
            colorGf={colorGf}
            textGfTime={textGfTime}
            isDocked={isDocked}
          />

          <Thruster
            textSpeed={textSpeed}
            colorHw={colorHw}
            colorSw={colorSw}
            colorOt={colorOt}
            colorThrust={colorThrust}
            isDocked={isDocked}
          />

          <Batteries
            onClick={handleBatteryClick}
            isDocked={isDocked}
            colorBat1={colorBat1}
            colorBat2={colorBat2}
            colorBat3={colorBat3}
            colorBat4={colorBat4}
            colorBat5={colorBat5}
            colorBat6={colorBat6}
            colorBat7={colorBat7}
            colorBat8={colorBat8}
            textVolts={textVolts}
            textAmps={textAmps}
            textAmpAgo={textAmpAgo}
            colorVolts={colorVolts}
            colorAmps={colorAmps}
          />

          <Comms
            textSat={textSat}
            textCommAgo={textCommAgo}
            colorSatComm={colorSatComm}
            textCell={textCell}
            textCellAgo={textCellAgo}
            colorCell={colorCell}
            isDocked={isDocked}
          />

          <Gps
            textGps={textGps}
            textGpsAgo={textGpsAgo}
            colorGps={colorGps}
            isDocked={isDocked}
          />

          <DvlIndicator
            colorDvl={colorDvl}
            textDvlStatus={textDvlStatus}
            isDocked={isDocked}
          />

          <Cart colorCart={colorCart} colorCartCircle={colorCartCircle} />

          <VehicleInfo
            textVehicle={textVehicle}
            textLastUpdate={textLastUpdate}
          />

          <ErrorLabel
            textCriticalError={textCriticalError}
            textCriticalTime={textCriticalTime}
          />

          <Note textNote={textNote} textNoteTime={textNoteTime} />
          <Leak
            textLeak={textLeak}
            textLeakAgo={textLeakAgo}
            colorLeak={colorLeak}
          />
        </g>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        height="100%"
        width="100%"
        viewBox={`0 0 ${containerSize?.width ?? 0} ${
          containerSize.height ?? 0
        }`}
        xmlSpace="preserve"
        style={style}
      >
        {isDocked ? (
          <rect
            data-testid={'dirtbox'}
            x="0"
            y={containerSize?.height - containerSize?.height * 0.4}
            className={colorDirtbox}
            width={containerSize?.width}
            height={containerSize?.height * 0.4}
          />
        ) : (
          <path
            data-testid={'background wave'}
            className={colorWavecolor}
            d={wavePath}
          />
        )}

        <g transform="scale(2)">
          <text
            data-testid="arrive_label"
            x="10"
            y="20"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
          >
            {textArriveLabel}
          </text>
          <text
            data-testid="text_arrivestation"
            className="st9 st13"
            x="10"
            y="30"
          >
            {textArriveStation}
          </text>
          <text
            data-testid="text_stationdist"
            className="st12 st9 st24"
            x="10"
            y="40"
          >
            {textStationDist}
          </text>
          <text
            data-testid="text_currentdist"
            className="st12 st9 st24"
            x="10"
            y="48"
          >
            {textCurrentDist}
          </text>

          <text
            data-testid="speed label"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
            x="10"
            y="68"
          >
            SPEED
          </text>
          <text aria-label="thrust time" className="st9 st10" x="10" y="78">
            {textThrustTime}
          </text>
          <text
            data-testid="reckoned_label"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
          >
            reckoned<title>Speed estimated from last two GPS fixes</title>
          </text>
          <text
            aria-label="reckoned detail"
            className="st12 st9 st24"
            x="10"
            y="88"
          >
            {textReckonDistance}
          </text>
          <text
            data-testid="heading label"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
            x="10"
            y="108"
          >
            HEADING
          </text>
          {!isDocked && textArrow && (
            <text aria-label="bearing" className="st24" x="20" y="118">
              {`${textArrow}°`}
            </text>
          )}
        </g>
      </svg>
      {!isDocked && (
        <FontAwesomeIcon
          icon={faArrowUp}
          className="absolute"
          style={{
            top: 224,
            left: 20,
            transform: `rotate(${textArrow}deg)`,
          }}
        />
      )}
    </div>
  )
}

FullWidthVehicleDiagram.displayName = 'Diagrams.Vehicle'
