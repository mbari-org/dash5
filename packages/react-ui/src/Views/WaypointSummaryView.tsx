import React from 'react'
import clsx from 'clsx'
import { SummaryList } from '../Data/SummaryList'
import { Table } from '../Data/Table'

export interface WaypointSummaryViewProps {
  className?: string
  style?: React.CSSProperties
  waypoints: Waypoint[]
  mission: string
  estimatedDuration: string
  estimatedDistance: string
  estimatedBottomDepth: string
}

export interface Waypoint {
  id?: string
  name: string
  lat: number
  long: number
}

export const WaypointSummaryView: React.FC<WaypointSummaryViewProps> = ({
  className,
  style,
  waypoints,
  mission,
  estimatedDuration,
  estimatedDistance,
  estimatedBottomDepth,
}) => {
  const tableRows =
    (waypoints &&
      waypoints?.map(({ name, lat, long }, index) => {
        return {
          cells: [
            {
              label: (
                <span>
                  Lat{index + 1}/Lon{index + 1}
                </span>
              ),
            },
            {
              label: (
                <div className="text-base">
                  <span className="font-bold">{name}</span>{' '}
                  <span>
                    {lat}, {long}
                  </span>
                </div>
              ),
            },
          ],
          highlighted: true,
        }
      })) ||
    []

  return (
    <article
      className={clsx('bg-white p-4 font-display', className)}
      style={style}
    >
      <h1 className="mb-4 font-medium">
        Set up to 7 waypoints for Brizo&apos;s{' '}
        <span className="text-teal-500">{mission}</span> mission
      </h1>

      <h3 className="my-2">Summary of waypoints ({waypoints?.length || 0})</h3>
      <section className="grid grid-cols-2 gap-4">
        <SummaryList
          header={'ESTIMATES'}
          values={[
            <div key="distance">
              <span className="mr-1 font-medium">Total Distance:</span>
              <span> {estimatedDistance}</span>
            </div>,
            <div key="bottomDepth">
              <span className="mr-1 font-medium">Est. bottom depth:</span>
              <span>{estimatedBottomDepth}</span>
            </div>,
            <div key="duration">
              <span className="mr-1 font-medium">Est. duration:</span>
              <span>{estimatedDuration}</span>
            </div>,
          ]}
        />
        <Table
          header={{
            cells: [
              {
                label: 'WAYPOINTS',
              },
              { label: 'VALUES' },
            ],
          }}
          rows={tableRows}
          highlightedStyle="text-teal-500"
          scrollable
          grayHeader
        />
      </section>
    </article>
  )
}

WaypointSummaryView.displayName = 'Views.WaypointSummaryView'
