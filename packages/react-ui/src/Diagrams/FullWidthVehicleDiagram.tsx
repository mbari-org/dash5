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
import { Comms } from './VehicleAssets/Comms'
import { Gps } from './VehicleAssets/Gps'
import { VehicleInfo } from './VehicleAssets/VehicleInfo'
import { Cart } from './VehicleAssets/Cart'
import { ErrorLabel } from './VehicleAssets/ErrorLabel'
import { Note } from './VehicleAssets/Note'
import { ArriveInfo } from './VehicleAssets/ArriveInfo'
import { VehicleProps } from './Vehicle'
import { Heading } from './VehicleAssets/Heading'

export const FullWidthVehicleDiagram: React.FC<VehicleProps> = ({
  className,
  style,
  status,
  textVehicle,
  textLastUpdate,
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
}) => {
  const isDocked = status === 'pluggedIn' || status === 'recovered'
  return (
    <div
      className={clsx('w-full bg-white p-0', className)}
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
        height="100%"
        width="100%"
        viewBox="128 155 510 162.5"
        xmlSpace="preserve"
        style={style}
      >
        <Background
          colorDirtbox={colorDirtbox}
          colorWavecolor={colorWavecolor}
        />

        <ArriveInfo
          textArriveLabel={textArriveLabel}
          textArriveStation={textArriveStation}
          textCurrentDist={textCurrentDist}
          textStationDist={textStationDist}
          isDocked={isDocked}
          isFullWidthDiagram
        />

        <Heading
          textArrow={textArrow}
          textThrustTime={textThrustTime}
          textReckonDistance={textReckonDistance}
          colorArrow={colorArrow}
          isDocked={isDocked}
          isFullWidthDiagram
        />

        <g transform="translate(40)">
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
        </g>
      </svg>
    </div>
  )
}

FullWidthVehicleDiagram.displayName = 'Diagrams.Vehicle'
