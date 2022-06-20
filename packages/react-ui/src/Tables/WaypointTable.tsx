import React, { useState } from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select } from '../Fields/Select'
import { Button, IconButton } from '../Navigation'
import { faMapMarkerAlt } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { makeOrdinal, swallow } from '@mbari/utils'
import { WaypointField } from './WaypointField'

export interface WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  waypoints: WaypointProps[]
  stations?: Station[]
  focusWaypointIndex?: number
  onFocusWaypoint?: (index: number) => void
  onCancelFocus?: (index: number) => void
  onDone?: () => void
}

export interface WaypointProps {
  id?: string
  station?: Station
}

export interface Station {
  id?: string
  name: string
  lat: number
  long: number
}

export interface StationOption {
  id: string
  name: string
}

const styles = {
  iconButton: 'ml-2 border-[1px] border-black/40 h-full w-full',
  absoluteAndCentered: 'absolute inset-0 flex justify-center',
  markerIconNumber: 'pt-1 text-base font-medium text-white',
}

export const WaypointTable: React.FC<WaypointTableProps> = ({
  className,
  style,
  waypoints,
  stations,
  focusWaypointIndex,
  onFocusWaypoint,
  onCancelFocus,
  onDone,
}) => {
  const initialWaypoints = waypoints.map((waypoint) =>
    waypoint.station ? waypoint.station : null
  )
  const [selectedWaypoints, setSelectedWaypoints] =
    useState<(Station | null | undefined)[]>(initialWaypoints)

  const updateSelectedWaypoints = (
    indexToChange: number,
    selected: Station
  ) => {
    const updatedWaypoints: (Station | null | undefined)[] =
      selectedWaypoints.map((waypoint, index) =>
        index === indexToChange ? selected : waypoint
      )

    setSelectedWaypoints(updatedWaypoints)
  }

  const handleCancel = () => {
    typeof focusWaypointIndex === 'number' &&
      onCancelFocus?.(focusWaypointIndex)
  }

  const NumberedMarker = (num: number, isActive?: boolean) => {
    return (
      <div
        className="relative mr-2 p-4"
        aria-label={`Number ${num} map marker icon`}
      >
        <div className={styles.absoluteAndCentered}>
          <FontAwesomeIcon
            icon={faMapMarker as IconProp}
            data-testid="map marker icon"
            className={clsx(isActive ? 'text-purple-700' : 'opacity-60')}
          />
        </div>
        <div className={styles.absoluteAndCentered}>
          <span className={styles.markerIconNumber}>{num}</span>
        </div>
      </div>
    )
  }

  const selectOptions: StationOption[] | undefined = stations?.map(
    ({ name, lat, long }) => ({
      id: name,
      name: `${name} ${lat}, ${long}`,
    })
  )

  const selectOptionsWithCustom: StationOption[] | undefined = (selectOptions &&
    [{ id: 'Custom', name: 'Custom' }].concat(selectOptions)) || [
    { id: 'Custom', name: 'Custom' },
  ]

  const Row = (rowIndex: number) => {
    const [isCustom, setIsCustom] = useState(
      selectedWaypoints[rowIndex]?.name === 'Custom'
    )
    const handleFocusWaypoint = () => {
      onFocusWaypoint?.(rowIndex)
    }

    const handleSelectStation = (id: string) => {
      const selectedStation = stations?.find(({ name }) => name === id)

      selectedStation && updateSelectedWaypoints(rowIndex, selectedStation)
    }

    const rowNumber = rowIndex + 1

    const activeRow =
      typeof focusWaypointIndex === 'number' ||
      isCustom ||
      !!selectedWaypoints[rowIndex]

    return {
      cells: [
        {
          icon: NumberedMarker(rowNumber, activeRow),
          label: (
            <div className={clsx(activeRow && 'text-teal-600')}>
              Lat{rowNumber}/Lon{rowNumber}
            </div>
          ),
          secondary: (
            <div className="truncate">
              Latitude of {makeOrdinal(rowNumber)} waypoint. If NaN, waypoint
              will be skipped/Longitude
            </div>
          ),
        },
        {
          label: (
            <div className="flex h-full w-full items-center">
              <div className="w-11/12">
                {selectedWaypoints[rowIndex] || isCustom ? (
                  <WaypointField
                    rowIndex={rowIndex}
                    stationName={selectedWaypoints[rowIndex]?.name}
                    lat={selectedWaypoints[rowIndex]?.lat}
                    long={selectedWaypoints[rowIndex]?.long}
                    stationOptions={stations}
                    handleSelect={handleSelectStation}
                    handleUpdate={updateSelectedWaypoints}
                    isCustom={isCustom}
                    setIsCustom={setIsCustom}
                  />
                ) : (
                  <Select
                    placeholder="Set waypoint"
                    name="waypoint selector"
                    options={selectOptionsWithCustom}
                    onSelect={(id) =>
                      id === 'Custom'
                        ? setIsCustom(true)
                        : id && handleSelectStation(id)
                    }
                  />
                )}
              </div>
              <div className="mr-4 flex w-1/12 items-center">
                <IconButton
                  icon={faMapMarkerAlt}
                  ariaLabel={'Map marker button'}
                  className={clsx(styles.iconButton, 'rounded-lg')}
                  style={{ height: '2.5rem', width: '2.5rem' }}
                  size="text-2xl"
                  noPadding
                  onClick={handleFocusWaypoint}
                />
              </div>
            </div>
          ),
        },
      ],
    }
  }

  const waypointRows = waypoints.map((_, index) => {
    return Row(index)
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
            <Table rows={[Row(focusWaypointIndex)]} scrollable />
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
