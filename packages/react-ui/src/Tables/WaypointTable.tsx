import React, { useState } from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select } from '../Fields/Select'
import { Button, IconButton } from '../Navigation'
import { faMapMarkerAlt } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { swallow } from '@mbari/utils'
import { WaypointField } from './WaypointField'

export interface WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  waypoints: WaypointProps[]
  stations?: Station[]
  focusWaypointIndex?: number
  grayHeader?: boolean
  onFocusWaypoint?: (index: number) => void
  onCancelFocus?: (index: number) => void
  onDone?: () => void
  onUpdate?: (updatedWaypoints: WaypointProps[]) => void
}

export interface Station {
  id?: string
  name: string
  lat: string
  lon: string
}

export interface StationOption {
  id: string
  name: string
}

export interface WaypointProps {
  latName: string
  lonName: string
  stationName?: string
  description?: string
  lat?: string
  lon?: string
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
  grayHeader,
  onFocusWaypoint,
  onCancelFocus,
  onDone,
  onUpdate,
}) => {
  const initialWaypoints = waypoints.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )

  const [selectedWaypoints, setSelectedWaypoints] =
    useState<WaypointProps[]>(initialWaypoints)

  const updateSelectedWaypoints = (
    indexToChange: number,
    selected: Station
  ) => {
    const waypointToUpdate: WaypointProps = {
      ...waypoints[indexToChange],
      stationName: selected.name,
      lat: selected.lat,
      lon: selected.lon,
    }

    const updatedWaypoints: WaypointProps[] = selectedWaypoints.map(
      (waypoint, index) =>
        index === indexToChange ? waypointToUpdate : waypoint
    )
    onUpdate?.(updatedWaypoints)
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
    ({ name, lat, lon }) => ({
      id: name,
      name: `${name} ${lat}, ${lon}`,
    })
  )

  const selectOptionsWithCustom: StationOption[] | undefined = (selectOptions &&
    [{ id: 'Custom', name: 'Custom' }].concat(selectOptions)) || [
    { id: 'Custom', name: 'Custom' },
  ]

  const Row = (rowIndex: number) => {
    const { latName, lonName, description } = waypoints[rowIndex]
    const [isCustom, setIsCustom] = useState(
      selectedWaypoints[rowIndex]?.stationName === 'Custom'
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
      !!selectedWaypoints[rowIndex]?.stationName

    return {
      cells: [
        {
          icon: NumberedMarker(rowNumber, activeRow),
          label: (
            <div className={clsx(activeRow && 'text-teal-600')}>
              {latName}/{lonName}
            </div>
          ),
          secondary: (
            <div className="truncate">
              {description ?? 'No description provided.'}
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
                    stationName={selectedWaypoints[rowIndex]?.stationName}
                    lat={selectedWaypoints[rowIndex]?.lat}
                    lon={selectedWaypoints[rowIndex]?.lon}
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
          grayHeader={grayHeader}
        />
      )}
    </article>
  )
}

WaypointTable.displayName = 'Tables.WaypointTable'
