import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select, SelectOption } from '../Fields/Select'
import { IconButton } from '../Navigation'
import { faMapMarkerAlt } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { makeOrdinal } from '../../../utils/src/makeOrdinal'

export interface WaypointsTableProps {
  className?: string
  style?: React.CSSProperties
  waypoints: Waypoint[]
  onSelectOption?: (id: string | null) => void
  onLocation?: () => void
}

export interface Waypoint {
  id?: string
  options: SelectOption[]
}

const styles = {
  iconButton: 'ml-2 h-fit w-fit border-2 border-black/40 px-2 py-1',
  absoluteAndCentered: 'absolute inset-0 flex justify-center',
  markerIconNumber: 'pt-1 text-base font-medium text-white',
}

const NumberedMarker = (num: number) => {
  return (
    <div
      className="relative mr-2 p-4"
      aria-label={`Number ${num} map marker icon`}
    >
      <div className={styles.absoluteAndCentered}>
        <FontAwesomeIcon
          icon={faMapMarker as IconProp}
          className="opacity-60"
        />
      </div>
      <div className={styles.absoluteAndCentered}>
        <span className={styles.markerIconNumber}>{num}</span>
      </div>
    </div>
  )
}

export const WaypointsTable: React.FC<WaypointsTableProps> = ({
  className,
  style,
  waypoints,
  onSelectOption,
  onLocation,
}) => {
  const WaypointRows = waypoints.map(({ options }, index) => {
    const rowNumber = index + 1

    return {
      cells: [
        {
          icon: NumberedMarker(rowNumber),
          label: `Lat${rowNumber}/Lon${rowNumber}`,
          secondary: (
            <div className="truncate">
              Latitude of {makeOrdinal(rowNumber)} waypoint. If NaN, waypoint
              will be skipped/Longitude
            </div>
          ),
        },
        {
          label: (
            <div className="flex">
              <Select
                placeholder="Set waypoint"
                name="waypoint selector"
                options={options}
                onSelect={onSelectOption}
              />

              <IconButton
                icon={faMapMarkerAlt}
                ariaLabel={'Map marker button'}
                style={{
                  borderRadius: '0.5rem',
                }}
                className={styles.iconButton}
                size="text-2xl"
                noPadding={true}
                onClick={onLocation}
              />
            </div>
          ),
        },
      ],
    }
  })

  return (
    <div className={clsx('', className)} style={style}>
      <Table
        header={{
          cells: [
            { label: 'WAYPOINTS' },
            { label: 'VALUES', secondary: 'If NaN, waypoint will be skipped' },
          ],
        }}
        rows={WaypointRows}
        scrollable
      />
    </div>
  )
}

WaypointsTable.displayName = 'Tables.WaypointsTable'
