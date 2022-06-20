import React from 'react'
import clsx from 'clsx'
import { SummaryList } from '../Data/SummaryList'
import { Table } from '../Data/Table'

export interface WaypointSummaryViewProps {
  className?: string
  style?: React.CSSProperties
  waypoints: Waypoint[]
  mission: string
  maxWaypoints: number
  vehicle: string
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

const styles = {
  container: 'bg-white p-4 font-display',
  setupHeader: 'mb-4 font-medium',
  summarySection: 'grid grid-cols-2 gap-4',
  estimateItem: 'mr-1 font-medium',
  tealText: 'text-teal-500',
}

export const WaypointSummaryView: React.FC<WaypointSummaryViewProps> = ({
  className,
  style,
  waypoints,
  mission,
  maxWaypoints,
  vehicle,
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
    <article className={clsx(styles.container, className)} style={style}>
      <h1 className={styles.setupHeader}>
        Set up to {maxWaypoints} waypoints for {vehicle}&apos;s{' '}
        <span className={styles.tealText}>{mission}</span> mission
      </h1>

      <h3 className="my-2">Summary of waypoints ({waypoints?.length || 0})</h3>
      <section className={styles.summarySection}>
        <SummaryList
          header={'ESTIMATES'}
          values={[
            <div key="distance">
              <span className={styles.estimateItem}>Total Distance:</span>
              <span> {estimatedDistance}</span>
            </div>,
            <div key="bottomDepth">
              <span className={styles.estimateItem}>Est. bottom depth:</span>
              <span>{estimatedBottomDepth}</span>
            </div>,
            <div key="duration">
              <span className={styles.estimateItem}>Est. duration:</span>
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
          highlightedStyle={styles.tealText}
          scrollable
          grayHeader
        />
      </section>
    </article>
  )
}

WaypointSummaryView.displayName = 'Views.WaypointSummaryView'
