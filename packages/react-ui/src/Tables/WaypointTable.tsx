import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select, SelectOption } from '../Fields/Select'
import { Button, IconButton } from '../Navigation'
import { faMapMarkerAlt } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { makeOrdinal, swallow } from '@mbari/utils'

export interface WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  waypoints: WaypointProps[]
  focusWaypointIndex?: number
  onSelectOption?: (id: string | null) => void
  onFocusWaypoint?: (index: number) => void
  onCancelFocus?: (index: number) => void
  onDone?: () => void
}

export interface WaypointProps {
  id?: string
  options: SelectOption[]
}

const styles = {
  iconButton: 'ml-2 h-fit w-fit border-2 border-black/40 px-2 py-1',
  absoluteAndCentered: 'absolute inset-0 flex justify-center',
  markerIconNumber: 'pt-1 text-base font-medium text-white',
}

export const WaypointTable: React.FC<WaypointTableProps> = ({
  className,
  style,
  waypoints,
  focusWaypointIndex,
  onSelectOption,
  onFocusWaypoint,
  onCancelFocus,
  onDone,
}) => {
  const handleCancel = () => {
    focusWaypointIndex && onCancelFocus?.(focusWaypointIndex)
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
            data-testid="map marker icon"
            className={clsx(
              focusWaypointIndex ? 'text-purple-700' : 'opacity-60'
            )}
          />
        </div>
        <div className={styles.absoluteAndCentered}>
          <span className={styles.markerIconNumber}>{num}</span>
        </div>
      </div>
    )
  }

  const row = (options: WaypointProps['options'], index: number) => {
    const handleFocusWaypoint = () => {
      onFocusWaypoint?.(index)
    }

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
                onClick={handleFocusWaypoint}
              />
            </div>
          ),
        },
      ],
    }
  }

  const waypointRows = waypoints.map(({ options }, index) => {
    return row(options, index)
  })

  return (
    <article className={clsx('bg-white p-2', className)} style={style}>
      {typeof focusWaypointIndex === 'number' ? (
        <ul>
          <li className="py-2 pl-8 font-semibold">
            Place the location pin to set Lat{focusWaypointIndex + 1}/Lon
            {focusWaypointIndex + 1}
          </li>
          <li>
            <Table
              rows={[
                row(waypoints[focusWaypointIndex].options, focusWaypointIndex),
              ]}
            />
          </li>
          <li className="flex justify-end py-2 pr-4">
            <Button
              appearance="secondary"
              onClick={swallow(handleCancel)}
              aria-label="cancel"
              className="mr-2"
            >
              Cancel
            </Button>
            <Button appearance="primary" onClick={swallow(onDone)}>
              Done
            </Button>
          </li>
        </ul>
      ) : (
        <Table
          header={{
            cells: [
              { label: 'WAYPOINTS' },
              {
                label: 'VALUES',
                secondary: 'If NaN, waypoint will be skipped',
              },
            ],
          }}
          rows={waypointRows}
          scrollable
        />
      )}
    </article>
  )
}

WaypointTable.displayName = 'Tables.WaypointTable'
