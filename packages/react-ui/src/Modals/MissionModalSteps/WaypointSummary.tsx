import React from 'react'
import { SummaryList } from '../../Data/SummaryList'
import { Table } from '../../Data/Table'

import { WaypointProps } from '../../Tables/WaypointTable'

export interface WaypointSummaryProps {
  vehicleName: string
  mission: string
  waypoints: WaypointProps[]
  totalDistance?: string
  bottomDepth?: string
  duration?: string
}

export const WaypointSummary: React.FC<WaypointSummaryProps> = ({
  vehicleName,
  mission,
  totalDistance,
  bottomDepth,
  duration,
  waypoints,
}) => {
  const waypointCount = waypoints.length ?? 0

  const plottedWaypoints = waypoints.filter(
    ({ lat, lon }) => lat !== 'NaN' || lon !== 'NaN'
  )

  const plottedWaypointCount = plottedWaypoints.length ?? 0

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
            <div key={lon + lonName}>
              <span className="font-bold">{stationName}</span> {lat}, {lon}
            </div>
          ),
        },
      ],
      highlighted: true,
    })
  )

  return (
    <article className="">
      <ul className="mx-4 flex flex-col pb-2">
        <li className="mb-4">
          Set up to {waypointCount} waypoint
          {waypointCount !== 1 && 's'} for {vehicleName}&apos;s{' '}
          <span className="text-teal-500" data-testid="mission name">
            {mission}
          </span>{' '}
          mission
        </li>
        <li className="flex items-center">
          Summary of Waypoints ({plottedWaypointCount})
        </li>
      </ul>
      <ul className="grid grid-cols-2 gap-2">
        <li>
          <SummaryList
            header={'ESTIMATES'}
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
        </li>
        <li>
          <Table
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
        </li>
      </ul>
    </article>
  )
}
