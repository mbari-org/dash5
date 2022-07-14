import React from 'react'
import clsx from 'clsx'
import { DropWeightIndicator } from './VehicleAssets/DropWeightIndicator'
import { DvlIndicator } from './VehicleAssets/DvlIndicator'
import { Background } from './VehicleAssets/Background'
import { ChargingCable } from './VehicleAssets/ChargingCable'
import { AuvBody } from './VehicleAssets/AuvBody'
import { Thruster } from './VehicleAssets/Thruster'
import { GroundFault } from './VehicleAssets/GroundFault'
import { Batteries } from './VehicleAssets/Batteries'
import { MissionLabel } from './VehicleAssets/MissionLabel'
import { Comms } from './VehicleAssets/Comms'
import { ScheduleLabel } from './VehicleAssets/ScheduleLabel'
import { Gps } from './VehicleAssets/Gps'
import { Log } from './VehicleAssets/Log'
import { VehicleInfo } from './VehicleAssets/VehicleInfo'
import { NextCommLabel } from './VehicleAssets/NextCommLabel'
import { TimeoutLabel } from './VehicleAssets/TimeoutLabel'
import { Cart } from './VehicleAssets/Cart'
import { Heading } from './VehicleAssets/Heading'
import { ArriveInfo } from './VehicleAssets/ArriveInfo'
import { ErrorLabel } from './VehicleAssets/ErrorLabel'
import { Note } from './VehicleAssets/Note'

export interface VehicleProps {
  className?: string
  style?: React.CSSProperties
  status: 'onMission' | 'recovered' | 'pluggedIn'
  textVehicle: string
  textLastUpdate?: string
  textMission: string
  colorMissionDefault?: string
  textArrow?: string
  colorArrow?: string
  colorDvl?: string
  textDvlStatus?: string
  batteryVolts?: number
  batteryAmps?: number
  batteryAmpTime?: string
  textGps?: string
  colorGps?: string
  textGpsAgo?: string
  textSat?: string
  textCommAgo?: string
  colorSatComm?: string
  textCell?: string
  textCellAgo?: string
  colorCell?: string
  textNextComm?: string
  colorNextComm?: string
  textTimeout?: string
  colorMissionAgo?: string
  colorDirtbox?: string
  colorWavecolor?: string
  colorSmallCable?: string
  colorBigCable?: string
  textDroptime?: string
  colorDrop?: string
  colorGf?: string
  textGf?: string
  textGfTime?: string
  textSpeed?: string
  colorHw?: string
  colorSw?: string
  colorOt?: string
  colorThrust?: string
  colorBat1?: string
  colorBat2?: string
  colorBat3?: string
  colorBat4?: string
  colorBat5?: string
  colorBat6?: string
  colorBat7?: string
  colorBat8?: string
  textVolts?: string
  textAmps?: string
  textAmpAgo?: string
  colorVolts?: string
  colorAmps?: string
  textScheduled?: string
  colorScheduled?: string
  colorCart?: string
  colorCartCircle?: string
  textThrustTime?: string
  textReckonDistance?: string
  textLogTime?: string
  textLogAgo?: string
  textArriveLabel?: string
  textArriveStation?: string
  textStationDist?: string
  textCurrentDist?: string
  textCriticalError?: string
  textCriticalTime?: string
  ubatColor?: string
  textNote?: string
  textNoteTime?: string
  colorFlow?: string
  textFlow?: string
}

export const Vehicle: React.FC<VehicleProps> = ({
  className,
  style,
  status,
  textVehicle,
  textLastUpdate,
  textMission,
  colorMissionDefault = 'st1',
  textArrow,
  colorArrow,
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
  textNextComm,
  colorNextComm,
  textTimeout,
  colorMissionAgo = 'st3',
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
  textVolts,
  textAmps,
  textAmpAgo,
  colorVolts = 'st3',
  colorAmps = 'st3',
  textScheduled,
  colorScheduled = 'st1',
  colorCart = 'st18',
  colorCartCircle = 'st18',
  textLogTime,
  textLogAgo,
  textArriveLabel = 'Arrive Station',
  textArriveStation,
  textCurrentDist,
  textStationDist,
  textCriticalError,
  textCriticalTime,
  ubatColor = 'st3',
  textNote,
  textNoteTime,
  colorFlow = 'st3',
  textFlow,
}) => {
  const isDocked = status === 'pluggedIn' || status === 'recovered'
  return (
    <div
      className={clsx('', className)}
      style={style}
      aria-label="vehicle diagram"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        viewBox="120 155 534 176"
        xmlSpace="preserve"
        style={style}
      >
        <rect
          aria-label="backgroundbox"
          x="126.91"
          y="161.76"
          className="st3"
          width="514.08"
          height="156.08"
        />
        <Background
          colorDirtbox={colorDirtbox}
          colorWavecolor={colorWavecolor}
        />
        <rect
          aria-label="backgroundboxborder"
          x="126.91"
          y="161.76"
          className="st1"
          width="514.08"
          height="156.08"
        />

        <ChargingCable
          colorSmallCable={colorSmallCable}
          colorBigCable={colorBigCable}
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

        <MissionLabel
          textMission={textMission}
          colorMissionDefault={colorMissionDefault}
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
          />
        )}

        {textTimeout && (
          <TimeoutLabel
            textTimeout={textTimeout}
            colorMissionAgo={colorMissionAgo}
          />
        )}

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

        {/* textArrow is used instead of textBearing for the bearing display due to the encoding of the degree symbol in the textBearing string */}
        <Heading
          textArrow={textArrow}
          textThrustTime={textThrustTime}
          textReckonDistance={textReckonDistance}
          colorArrow={colorArrow}
          isDocked={isDocked}
        />

        <Log
          textLogTime={textLogTime}
          textLogAgo={textLogAgo}
          isDocked={isDocked}
        />

        <VehicleInfo
          textVehicle={textVehicle}
          textLastUpdate={textLastUpdate}
        />

        <ArriveInfo
          textArriveLabel={textArriveLabel}
          textArriveStation={textArriveStation}
          textCurrentDist={textCurrentDist}
          textStationDist={textStationDist}
          isDocked={isDocked}
        />

        <ErrorLabel
          textCriticalError={textCriticalError}
          textCriticalTime={textCriticalTime}
        />

        <Note textNote={textNote} textNoteTime={textNoteTime} />

        {/* <!--pontus specific but can be made invisible--> */}
        <circle
          name="UBAT"
          className={ubatColor}
          cx="543.96"
          cy="246.8"
          r="4.07"
        />
        <circle
          name="flow"
          className={colorFlow}
          cx="544.33"
          cy="259.45"
          r="4.07"
        />
        <text
          name="text_flowago"
          transform="matrix(1 0 0 1 541.0 272.0)"
          className="st12 st9 st13"
        >
          {textFlow}
        </text>
      </svg>
    </div>
  )
}

Vehicle.displayName = 'Diagrams.Vehicle'
