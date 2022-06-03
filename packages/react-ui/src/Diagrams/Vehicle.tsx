import React from 'react'
import clsx from 'clsx'
import { DropWeightIndicator } from './vehicleAssets/DropWeightIndicator'
import { DvlIndicator } from './vehicleAssets/DvlIndicator'
import { Background } from './vehicleAssets/Background'
import { ChargingCable } from './vehicleAssets/ChargingCable'
import { AuvBody } from './vehicleAssets/AuvBody'
import { Thruster } from './vehicleAssets/Thruster'
import { GroundFault } from './vehicleAssets/GroundFault'
import { Batteries } from './vehicleAssets/Batteries'
import { MissionLabel } from './vehicleAssets/MissionLabel'
import { Comms } from './vehicleAssets/Comms'
import { ScheduleLabel } from './vehicleAssets/ScheduleLabel'
import { Gps } from './vehicleAssets/Gps'
import { Log } from './vehicleAssets/Log'
import { VehicleInfo } from './vehicleAssets/VehicleInfo'
import { NextCommLabel } from './vehicleAssets/NextCommLabel'
import { TimeoutLabel } from './vehicleAssets/TimeoutLabel'
import { Cart } from './vehicleAssets/Cart'
import { Heading } from './vehicleAssets/Heading'
import { ArriveInfo } from './vehicleAssets/ArriveInfo'
import { ErrorLabel } from './vehicleAssets/ErrorLabel'
import { Note } from './vehicleAssets/Note'

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
    <div className={clsx('', className)} style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        viewBox="120 155 534 176"
        xmlSpace="preserve"
      >
        <style type="text/css">{`
	.st0{fill:#CFDEE2;}
	.st1{fill:none;stroke:#000000; }
	.st2{fill:#D4D2D2;stroke:#000000; }
	.st3{fill:#FFFFFF;stroke:#000000; }
	.st4{fill:#5AC1A4;stroke:#000000; } 
	.st5{fill:#FFE850;stroke:#000000; } 
	.st6{fill:#EF9D30;stroke:#000000; } 
	.st7{fill:#FFFFFF;stroke:#000000;stroke-linecap:round; }
	.st8{fill:#C6C4C4;stroke:#000000;stroke-linecap:round; }
	.st9{font-family:HelveticaNeue, Helvetica, Arial, sans-serif;}
	.st10{font-size:9px;}
	.st11{fill:#6D6E6E;stroke:#000000; } 
	.st12{fill:#606060;}  
	.st13{font-size:7px;}
	.st14{font-family:HelveticaNeue-Medium, Helvetica, Arial, sans-serif; }
	.st15{font-size:11px;}
	.st16{fill:#A2A0A0;} <!--
	.st17{fill:#e3cfa7;} 
	.st18{fill:none;stroke:none; } 
	.st19{fill:#555555;stroke:#000000;stroke-miterlimit:10;}  color -->
	.st20{fill:#e3cfa7;stroke:#000000;stroke-miterlimit:10;}  Circle color -->
	.st21{fill:none;stroke:#46A247;stroke-width:4;stroke-miterlimit:10;} 
	.st22{fill:none;stroke:#555555;stroke-width:9;stroke-linecap:round;stroke-miterlimit:10;} 
	.st23{fill:none;stroke:#46A247;stroke-width:4;stroke-miterlimit:10;} 
	.st24{font-size:6px;}
	.st25{fill:#5AC1A4;stroke:none; } 
	.st26{fill:#FFE850;stroke:none; } 
	.st27{fill:#EF9D30;stroke:none; } 
	.st28{fill:#333333; } 
	.st30{font-size:8px;} 
	.st31{fill:#B4372D;}
	.stleak2{fill:#7DA6D8;} 
	.stleak1{fill:#92c19b;} 
	`}</style>
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

        {/* todo: change OT indicator color dynamically */}
        <Thruster
          textSpeed={textSpeed}
          colorHw={colorHw}
          colorSw={colorSw}
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

        {/* todo: change timeout indicator color dynamically */}
        {textTimeout && <TimeoutLabel textTimeout={textTimeout} />}

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
