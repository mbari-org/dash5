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
import { ArgosBatteryIndicator } from './VehicleAssets/ArgosBatteryIndicator'
import { VehicleInfo } from './VehicleAssets/VehicleInfo'
import { Cart } from './VehicleAssets/Cart'
import { ErrorLabel } from './VehicleAssets/ErrorLabel'
import { Note } from './VehicleAssets/Note'
import { CtdIndicator } from './VehicleAssets/CtdIndicator'
import { MissionLabel } from './VehicleAssets/MissionLabel'
import { ScheduleLabel } from './VehicleAssets/ScheduleLabel'
import { NextCommLabel } from './VehicleAssets/NextCommLabel'
import { TimeoutLabel } from './VehicleAssets/TimeoutLabel'
import { Log } from './VehicleAssets/Log'
import { Heading } from './VehicleAssets/Heading'
import { ArriveInfo } from './VehicleAssets/ArriveInfo'
import { VehicleProps } from './Vehicle'
import { useResizeObserver } from '@mbari/utils'
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
  colorArgo = 'st18',
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
  textMission = '',
  colorMissionDefault = 'st1',
  textScheduled,
  colorScheduled = 'st1',
  textNextComm,
  colorNextComm,
  textTimeout,
  colorMissionAgo = 'st3',
  textLogTime,
  textLogAgo,
  colorArrow,
  textArriveLabel = 'Arrive Station',
  textArriveStation,
  textCurrentDist,
  textStationDist,
  textCriticalError,
  textCriticalTime,
  textNote,
  textNoteTime,
  colorCtd = 'st18',
  textCameraAgo,
  colorVoltThresh,
  textVoltThresh,
  colorAmpThresh,
  textAmpThresh,
  textBatteryDuration,
  textBatteryUnits,
  textCurrent,
  textNeedsComms,
  textMissionAgo,
  textVersion,
  svgCurrent,
  vehicleWidth = 800,
  vehicleHeight = 300,
  onBatteryClick: handleBatteryClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { size: containerSize } = useResizeObserver({ element: containerRef })

  const isDocked = status === 'pluggedIn' || status === 'recovered'

  const waveHeight = containerSize?.height * 0.8
  const waveOffset = containerSize?.height * 0.2
  const waveWidth = containerSize.width
  const numberOfWaves = Math.floor(containerSize.width / 100)
  const wavePath = `M0,${waveOffset} ${new Array(numberOfWaves)
    .fill(null)
    .reduce((a, _, i) => {
      const start = 0
      const end = waveWidth / numberOfWaves
      const curveHeight = i < 1 ? 20 : 30
      return `${a} c${start},${curveHeight} ${end},${curveHeight + 20} ${end},0`
    }, '')} l0,${waveHeight} l${-waveWidth},${waveHeight} Z`

  return (
    <div
      className={clsx('relative h-full w-full overflow-hidden p-0', className)}
      style={style}
      aria-label="vehicle diagram"
      ref={containerRef}
    >
      {/* Background: waves when on mission, dirtbox when docked */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        x="0px"
        y="0px"
        height="100%"
        width="100%"
        viewBox={`0 0 ${containerSize?.width ?? 0} ${
          containerSize.height ?? 0
        }`}
        xmlSpace="preserve"
      >
        {isDocked ? (
          <rect
            data-testid="dirtbox"
            x="0"
            y={containerSize?.height - containerSize?.height * 0.4}
            className={colorDirtbox}
            width={containerSize?.width}
            height={containerSize?.height * 0.4}
          />
        ) : (
          <path
            data-testid="background wave"
            className={colorWavecolor}
            d={wavePath}
          />
        )}
      </svg>

      {/* Vehicle diagram: scales to fill container while preserving aspect ratio */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        viewBox="120 155 534 176"
        preserveAspectRatio="xMidYMid meet"
        xmlSpace="preserve"
        className="absolute inset-0 z-10 h-full w-full"
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
            colorVoltThresh={colorVoltThresh}
            textVoltThresh={textVoltThresh}
            colorAmpThresh={colorAmpThresh}
            textAmpThresh={textAmpThresh}
            textBatteryDuration={textBatteryDuration}
            textBatteryUnits={textBatteryUnits}
            textCurrent={textCurrent}
            svgCurrent={svgCurrent}
          />

          <ArgosBatteryIndicator colorArgo={colorArgo} />

          <MissionLabel
            textMission={textMission}
            colorMissionDefault={colorMissionDefault}
            textMissionAgo={textMissionAgo}
          />

          {textScheduled && (
            <ScheduleLabel
              textScheduled={textScheduled}
              colorScheduled={colorScheduled}
            />
          )}

          {textNextComm && (
            <NextCommLabel
              textNextComm={textNextComm}
              colorNextComm={colorNextComm}
              textNeedsComms={textNeedsComms}
            />
          )}

          {textTimeout && (
            <TimeoutLabel
              textTimeout={textTimeout}
              colorMissionAgo={colorMissionAgo}
            />
          )}

          <Log
            textLogTime={textLogTime}
            textLogAgo={textLogAgo}
            isDocked={isDocked}
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

          <CtdIndicator
            colorCtd={colorCtd}
            textCameraAgo={textCameraAgo}
            isDocked={isDocked}
          />

          <DvlIndicator
            colorDvl={colorDvl}
            textDvlStatus={textDvlStatus}
            isDocked={isDocked}
          />

          <Cart colorCart={colorCart} colorCartCircle={colorCartCircle} />

          <Heading
            textArrow={textArrow}
            textThrustTime={textThrustTime}
            textReckonDistance={textReckonDistance}
            colorArrow={colorArrow}
            isDocked={isDocked}
          />

          <ArriveInfo
            textArriveLabel={textArriveLabel}
            textArriveStation={textArriveStation}
            textCurrentDist={textCurrentDist}
            textStationDist={textStationDist}
            isDocked={isDocked}
          />

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

          {textVersion && (
            <text
              aria-label="version"
              transform="matrix(1 0 0 1 618.0 314.0)"
              className="st12 st9 st13"
            >
              {textVersion}
            </text>
          )}
        </g>
      </svg>
    </div>
  )
}

FullWidthVehicleDiagram.displayName = 'Diagrams.Vehicle'
