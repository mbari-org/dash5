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

export interface VehicleProps {
  className?: string
  style?: React.CSSProperties
  status: 'onMission' | 'recovered' | 'pluggedIn'
  name: string
  updated?: string
  mission: string
  scheduled?: string
  headingDegrees?: string
  dropWeight?: boolean
  dropTime?: string
  dvl?: boolean
  hardwareLight?: boolean
  softwareLight?: boolean
  otherLight?: boolean
  groundFault?: string
  groundFaultTime?: string
  batteryVolts?: number
  batteryAmps?: number
  batteryAmpTime?: string
  gpsTime?: string
  satTime?: string
  cellTime?: string
  logStartTime?: string
  nextComm?: string
  timeout?: string
}

export const styles = {
  container: '',
  fillTeal: 'fill-teal-500',
  fillOrange: 'fill-orange-400',
  fillYellow: 'fill-yellow-300',
  fillGreen: 'fill-green-600',
  fillDarkGray: 'fill-neutral-500',
  text6px: 'text-[6px]',
  text7px: 'text-[7px]',
  text9px: 'text-[9px]',
  text11px: 'text-[11px]',
  textGray: 'fill-neutral-500',
}

export const Vehicle: React.FC<VehicleProps> = ({
  className,
  style,
  status,
  name,
  updated,
  mission,
  scheduled,
  headingDegrees,
  dropWeight,
  dropTime,
  dvl,
  hardwareLight,
  softwareLight,
  otherLight,
  groundFault,
  groundFaultTime,
  batteryVolts,
  batteryAmps,
  batteryAmpTime,
  gpsTime,
  satTime,
  cellTime,
  logStartTime,
  nextComm,
  timeout,
}) => {
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
        <Background status={status} />
        <rect
          aria-label="backgroundbox"
          x="126.91"
          y="161.76"
          fill="none"
          className={'stroke-black'}
          width="514.08"
          height="156.08"
        />

        {status === 'pluggedIn' && <ChargingCable />}

        <AuvBody />

        {/* todo: change color correctly to indicate status */}
        {/* calculate times since last and display dynamically */}
        <DropWeightIndicator dropWeight={dropWeight} dropTime={dropTime} />

        {/* todo: change color correctly to indicate status */}
        {/* calculate times since last and display dynamically */}
        <GroundFault
          groundFault={groundFault}
          groundFaultTime={groundFaultTime}
        />

        {/* todo: change color of HW/SW/etc to indicate status */}
        {/* todo: calculate speed and display dynamically; needs new props */}
        <Thruster
          status={status}
          hwLight={hardwareLight}
          swLight={softwareLight}
          otLight={otherLight}
        />

        {/* todo: correctly display charge amount */}
        {/* todo: calculate time since last amps and display dynamically */}
        <Batteries
          volts={batteryVolts}
          amps={batteryAmps}
          ampTime={batteryAmpTime}
        />

        {/* update status indicator to change colors */}
        {/* display date separately from label string? */}
        <MissionLabel mission={mission} />

        {/* update status indicator to change colors */}
        {/* display date separately from label string? */}
        <NextCommLabel nextComm={nextComm} />

        {/* update status indicator to change colors */}
        {/* display date separately from label string? */}
        <TimeoutLabel timeout={timeout} />

        {/* todo: change color of comms based on time */}
        {/* todo: calculate time since last comms and display dynamically */}
        <Comms satTime={satTime} cellTime={cellTime} />

        {/* todo: calculate time since last gps and display dynamically */}
        <Gps time={gpsTime} />

        <DvlIndicator dvl={dvl} />

        {/* todo: change cart coloring based on status? */}
        {status !== 'onMission' && <Cart />}

        {/* todo: dynamically calculate and display thrust over time */}
        {/* todo: dynamically calculate and display reckoned details */}
        <Heading headingDegrees={headingDegrees} />

        {scheduled && <ScheduleLabel scheduled={scheduled} />}

        {/* todo: calculate time since last log and display dynamically */}
        <Log startTime={logStartTime} />

        {/* todo: calculate and display updated field dynamically */}
        <VehicleInfo name={name} updated={updated} />

        {/* todo: change labels and time since last(?) dynamically; new props needed */}
        <ArriveInfo />

        {/* todo: change labels dynamically; new props needed */}
        <ErrorLabel />

        {/* <!-- future  */}
        {/* <text
          aria-label=""
          transform="matrix(1 0 0 1 557.3993 228.8362)"
          className="st9 st10"
          fontSize="9px"
        >
          B&amp;T?
        </text>
        <circle
          aria-label="BT2"
          className="st3"
          fill="#FFFFFF"
          className={'stroke-black'}
          cx="546.72"
          cy="225.78"
          r="4.07"
        />
        <circle
          aria-label="BT1"
          className="st3"
          fill="#FFFFFF"
          className={'stroke-black'}
          cx="535.99"
          cy="225.78"
          r="4.07"
        /> */}

        {/* <!-- OLD ARROW  */}
        {/* <g aria-label="arrow right">
          <rect
            x="594.14"
            y="256.24"
            className="st16"
            fill="#A2A0A0"
            width="11.73"
            height="7"
          />
          <g>
            <polygon
              className="st16"
              fill="#A2A0A0"
              points="618.22,259.74 600.81,266.86 604.94,259.74 600.81,252.63 		"
            />
          </g>
        </g> */}
        <text
          aria-label="test_note"
          transform="matrix(1 0 0 1 133 174)"
          // className="st12 st9 st13"
          fill="#606060"
          fontSize="7px"
        />
        <text
          aria-label="test_notetime"
          transform="matrix(1 0 0 1 134 180)"
          // className="st12 st9 st24"
          fill="#606060"
          fontSize="6px"
        />

        {/* <!--pontus specific but can be made invisible--> */}
        <circle
          aria-label="UBAT"
          // className="st3"
          fill="#FFFFFF"
          className={'stroke-black'}
          cx="543.96"
          cy="246.8"
          r="4.07"
        />
        <circle
          aria-label="flow"
          // className="st3"
          fill="#FFFFFF"
          className={'stroke-black'}
          cx="544.33"
          cy="259.45"
          r="4.07"
        />
        <text
          aria-label="text_flowago"
          transform="matrix(1 0 0 1 541.0 272.0)"
          // className="st12 st9 st13"
          className={clsx(styles.textGray, styles.text7px)}
        ></text>
      </svg>
    </div>
  )
}

Vehicle.displayName = 'Diagrams.Vehicle'
