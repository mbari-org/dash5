import React, { useRef, useState, useEffect } from 'react'
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
  onBatteryClick?: BatteryProps['onClick']
  sparklineContent?: React.ReactNode
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
  colorLowGf,
  colorHighGf,
  colorMissionText,
  colorLogAgo,
  colorSatCommsText,
  colorNextCommsText,
  colorTimeoutText,
  dockBuoy,
  dockEye,
  dockLine,
  dockTri,
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
  ubatColor = 'st18',
  colorFlow = 'st18',
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
  sparklineContent,
  textArriveLabel = 'Arrive Station',
  textArriveStation,
  textCurrentDist,
  textStationDist,
  textCriticalError,
  textCriticalTime,
  textNote,
  textNoteTime,
  colorCtd,
  colorCameraBody,
  colorCameraLens,
  colorCam1,
  colorCam2,
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
  colorDuration,
  onBatteryClick: handleBatteryClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { size: containerSize } = useResizeObserver({ element: containerRef })

  const isDocked = status === 'pluggedIn' || status === 'recovered'

  // px to push vehicle + waves down, creating white space at top
  const VEHICLE_TOP_OFFSET = 20

  // Sparkline base dimensions — correct size when the vehicle is height-bound (wide container)
  const SPARKLINE_BASE_W = 384 // 480 × 0.8
  const SPARKLINE_BASE_H = 96 // 120 × 0.8

  // Vehicle SVG viewBox dimensions
  const VB_W = 534
  const VB_H = 176

  const cW = containerSize?.width ?? 0
  const cH = containerSize?.height ?? 0

  // normalizedVehicleScale = 1 when the container is wide enough that the vehicle is
  // height-bound (no horizontal squeeze). Drops below 1 only when the container narrows
  // enough that the vehicle SVG itself starts to shrink — the sparkline follows exactly.
  const normalizedVehicleScale =
    cW > 0 && cH > 0 ? Math.min(1, (cW * VB_H) / (VB_W * cH)) : 1

  const sparklineW = Math.round(SPARKLINE_BASE_W * normalizedVehicleScale)
  const sparklineH = Math.round(SPARKLINE_BASE_H * normalizedVehicleScale)

  // Position locked — loaded once from localStorage (the final dragged position).
  // Drag removed; position will not change at runtime.
  const DEFAULT_POS = { x: 10, y: -10 }
  const storageKey = `sparkline-pos-v3-${textVehicle ?? 'default'}`
  const [sparklinePos, setSparklinePos] = useState(DEFAULT_POS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          parsed &&
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number'
        ) {
          setSparklinePos(parsed)
        }
      }
    } catch {}
  }, [storageKey])

  // // --- Drag removed — position is final ---
  // const handleSparklineMouseDown = (e: React.MouseEvent) => { ... }

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
        style={{ transform: `translateY(${VEHICLE_TOP_OFFSET}px)` }}
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
        style={{ transform: `translateY(${VEHICLE_TOP_OFFSET}px)` }}
      >
        <g>
          <ChargingCable
            colorSmallCable={colorSmallCable}
            colorBigCable={colorBigCable}
            isFullWidthDiagram
          />

          <AuvBody
            dockBuoy={dockBuoy}
            dockEye={dockEye}
            dockLine={dockLine}
            dockTri={dockTri}
          />

          <DropWeightIndicator
            textDroptime={textDroptime}
            colorDrop={colorDrop}
            isDocked={isDocked}
          />

          <GroundFault
            textGf={textGf}
            colorGf={colorGf}
            textGfTime={textGfTime}
            colorLowGf={colorLowGf}
            colorHighGf={colorHighGf}
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
            colorDuration={colorDuration}
          />

          <ArgosBatteryIndicator colorArgo={colorArgo} />

          <MissionLabel
            textMission={textMission}
            colorMissionDefault={colorMissionDefault}
            textMissionAgo={textMissionAgo}
            colorMissionText={colorMissionText}
          />

          {textScheduled && (
            <ScheduleLabel
              textScheduled={textScheduled}
              colorScheduled={colorScheduled}
            />
          )}

          {!isDocked && textNextComm && (
            <NextCommLabel
              textNextComm={textNextComm}
              colorNextComm={colorNextComm}
              textNeedsComms={textNeedsComms}
              colorNextCommsText={colorNextCommsText}
            />
          )}

          {textTimeout && (
            <TimeoutLabel
              textTimeout={textTimeout}
              colorMissionAgo={colorMissionAgo}
              colorTimeoutText={colorTimeoutText}
            />
          )}

          <Log
            textLogTime={textLogTime}
            textLogAgo={textLogAgo}
            colorLogAgo={colorLogAgo}
            isDocked={isDocked}
          />

          <Comms
            textSat={textSat}
            textCommAgo={textCommAgo}
            colorSatComm={colorSatComm}
            textCell={textCell}
            textCellAgo={textCellAgo}
            colorCell={colorCell}
            colorSatCommsText={colorSatCommsText}
            isDocked={isDocked}
          />

          <Gps
            textGps={textGps}
            textGpsAgo={textGpsAgo}
            colorGps={colorGps}
            isDocked={isDocked}
          />

          {/* UBAT/flow before CtdIndicator so camera body paints on top — matching Dash4 SVG order.
              White (st3) when docked, otherwise server-driven (pontus-specific). */}
          <circle
            name="UBAT"
            className={isDocked ? 'st3' : ubatColor}
            cx="544"
            cy="251"
            r="4"
          />
          <circle
            name="flow"
            className={isDocked ? 'st3' : colorFlow}
            cx="544"
            cy="261"
            r="4"
          />

          <CtdIndicator
            colorCtd={colorCtd}
            colorCameraBody={colorCameraBody}
            colorCameraLens={colorCameraLens}
            colorCam1={colorCam1}
            colorCam2={colorCam2}
            isDocked={isDocked}
          />

          <DvlIndicator
            colorDvl={colorDvl}
            textDvlStatus={textDvlStatus}
            isDocked={isDocked}
          />

          <Cart colorCart={colorCart} colorCartCircle={colorCartCircle} />

          {/* isFullWidthDiagram intentionally omitted: when true, Heading hides
              the heading arrow and moves text to front-section SVG coords
              (~x=135-142). Those positions overlap with the front-section
              elements already rendered above, causing a visual regression.
              The rear-section coordinates (default, isFullWidthDiagram=false)
              are the correct placement for the full-width diagram. */}
          <Heading
            textArrow={textArrow}
            textThrustTime={textThrustTime}
            textReckonDistance={textReckonDistance}
            colorArrow={colorArrow}
            isDocked={isDocked}
          />

          {/* isFullWidthDiagram intentionally omitted for the same reason as
              Heading above — front-section SVG coords conflict with existing
              front-section renders when the flag is set. */}
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

      {/* Sparkline overlay — fixed position, scales with vehicle when container narrows */}
      {!isDocked && sparklineContent && (
        <div
          className="absolute z-20 select-none"
          style={{
            left: sparklinePos.x,
            top: sparklinePos.y,
            width: sparklineW,
            height: sparklineH,
          }}
        >
          {sparklineContent}
        </div>
      )}
    </div>
  )
}

FullWidthVehicleDiagram.displayName = 'Diagrams.Vehicle'
