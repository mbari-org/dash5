import React from 'react'
import { ParameterProps } from '../../Tables/ParameterTable'
import { SummaryList } from '../../Data/SummaryList'
import { Table } from '../../Data/Table'

import { WaypointProps } from '../../Tables/WaypointTable'
import { makeValueUnitString } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface ReviewProps {
  parameters: ParameterProps[]
  safetyCommsParams: ParameterProps[]
  waypoints: WaypointProps[]
  totalDistance?: string
  bottomDepth?: string
  duration?: string
}

export const ReviewStep: React.FC<ReviewProps> = ({
  parameters,
  safetyCommsParams,
  waypoints,
  totalDistance,
  bottomDepth,
  duration,
}) => {
  const plottedWaypoints = waypoints.filter(
    ({ lat, lon }) => lat !== 'NaN' || lon !== 'NaN'
  )

  const plottedWaypointCount = plottedWaypoints.length ?? 0

  const overriddenMissionParams = parameters.filter(
    (param) => param.overrideValue
  )

  const overrideCount =
    safetyCommsParams.filter((param) => param.overrideValue)?.length +
      overriddenMissionParams?.length ?? 0

  const waypointRows = plottedWaypoints.map(
    ({ latName, lonName, stationName, lat, lon }) => ({
      cells: [
        {
          label: (
            <div key={latName}>
              {latName}/{lonName}
            </div>
          ),
        },
        {
          label: (
            <div key={lon + lonName} className="text-base">
              <span className="font-bold">{stationName}</span> {lat}, {lon}
            </div>
          ),
        },
      ],
      highlighted: true,
    })
  )

  const safetyCommsRows = safetyCommsParams.map(
    ({ name, unit, value, overrideValue, dvlOff }) => {
      // highlighted cell style is teal if it's an override or orange if dvl is off
      const customCellStyle = overrideValue
        ? 'text-teal-500'
        : 'text-orange-500/80'

      return {
        cells: [
          {
            label: <span>{name}</span>,
            highlighted: !!overrideValue || !!dvlOff,
            highlightedStyle: `${customCellStyle} font-medium`,
          },
          {
            label: (
              <span className="text-base">
                {overrideValue
                  ? makeValueUnitString(overrideValue, unit)
                  : makeValueUnitString(value, unit)}
              </span>
            ),
            highlighted: !!overrideValue || !!dvlOff,
            highlightedStyle: customCellStyle,
          },
        ],
      }
    }
  )

  const missionParamRows = overriddenMissionParams.map(
    ({ name, overrideValue, unit }) => ({
      cells: [
        {
          label: <span>{name}</span>,
        },
        {
          label: (
            <span className="text-base">
              {overrideValue ? makeValueUnitString(overrideValue, unit) : ''}
            </span>
          ),
        },
      ],
      highlighted: true,
    })
  )

  return (
    <article className="h-full">
      <section className="mx-4 mb-6">
        Review mission summary: {plottedWaypointCount} waypoint
        {plottedWaypointCount !== 1 && `s`} and {overrideCount} override
        {overrideCount !== 1 && `s`}
      </section>
      <ul className="flex max-h-full">
        <li className="mr-4 flex w-1/2 flex-col">
          <SummaryList
            className="mb-2 h-fit"
            header={<div className="opacity-60">ESTIMATES</div>}
            values={[
              <div key={totalDistance}>
                <span className="mr-1 font-medium">Total distance:</span>
                <span>{totalDistance}</span>
              </div>,
              <div key={bottomDepth}>
                <span className="mr-1 font-medium">Est. bottom depth:</span>
                <span>{bottomDepth}</span>
              </div>,
              <div key={duration}>
                <span className="mr-1 font-medium">Est. duration:</span>
                <span>{duration}</span>
              </div>,
            ]}
          />
          <Table
            className="max-h-[calc(95%-180px)] min-h-[130px]"
            scrollable
            grayHeader
            header={{
              cells: [
                {
                  label: 'SAFETY/COMMS',
                },
                {
                  label: 'VALUES',
                  secondary: (
                    <span className="text-orange-500">
                      DVL is off
                      <FontAwesomeIcon
                        icon={faInfoCircle as IconProp}
                        className="ml-2"
                      />
                    </span>
                  ),
                },
              ],
            }}
            rows={
              safetyCommsRows.length
                ? safetyCommsRows
                : [{ cells: [{ label: '' }, { label: '' }] }]
            }
            highlightedStyle={'text-teal-500'}
          />{' '}
        </li>
        <li className="flex max-h-full w-1/2 flex-col">
          <Table
            className="mb-2 max-h-[calc(53%-40px)] min-h-[130px]"
            scrollable
            grayHeader
            header={{
              cells: [
                {
                  label: 'WAYPOINTS',
                },
                { label: 'VALUES' },
              ],
            }}
            rows={waypointRows}
            highlightedStyle={'text-teal-500'}
          />
          <Table
            className="max-h-[calc(53%-40px)] min-h-[130px]"
            scrollable
            grayHeader
            header={{
              cells: [
                {
                  label: 'MISSION PARAMS.',
                },
                { label: 'OVERRIDDEN VALUES' },
              ],
            }}
            rows={
              missionParamRows.length
                ? missionParamRows
                : [{ cells: [{ label: 'No overrides' }, { label: '' }] }]
            }
            highlightedStyle={'text-teal-500'}
          />
        </li>
      </ul>
    </article>
  )
}
