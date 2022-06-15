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
  // TODO: set selectedWaypoints using incoming waypoint station data
  const [selectedWaypoints, setSelectedWaypoints] = useState<
    (Station | undefined)[]
  >([...Array(waypoints.length).fill(null)])

  const handleCancel = () => {
    typeof focusWaypointIndex === 'number' &&
      onCancelFocus?.(focusWaypointIndex)
  }

  const NumberedMarker = (num: number, isPurple?: boolean) => {
    return (
      <div
        className="relative mr-2 p-4"
        aria-label={`Number ${num} map marker icon`}
      >
        <div className={styles.absoluteAndCentered}>
          <FontAwesomeIcon
            icon={faMapMarker as IconProp}
            data-testid="map marker icon"
            className={clsx(isPurple ? 'text-purple-700' : 'opacity-60')}
          />
        </div>
        <div className={styles.absoluteAndCentered}>
          <span className={styles.markerIconNumber}>{num}</span>
        </div>
      </div>
    )
  }

  const stationOptions: StationOption[] | undefined = stations?.map(
    ({ name, lat, long }) => ({
      id: name,
      name: `${name} ${lat}, ${long}`,
    })
  )

  const stationOptionsWithCustom: StationOption[] | undefined =
    stationOptions && [{ id: 'Custom', name: 'Custom' }].concat(stationOptions)

  const Row = (rowIndex: number) => {
    const [isCustom, setIsCustom] = useState(false)
    const handleFocusWaypoint = () => {
      onFocusWaypoint?.(rowIndex)
    }

    const updateSelectedWaypoints = (selected: Station) => {
      const updatedWaypoints: (Station | undefined)[] = selectedWaypoints.map(
        (waypoint, index) => (index === rowIndex ? selected : waypoint)
      )

      setSelectedWaypoints(updatedWaypoints)
    }

    const handleSelectStation = (id: string) => {
      const selectedStation = stations?.find(({ name }) => name === id)

      if (selectedStation) updateSelectedWaypoints(selectedStation)
    }

    const rowNumber = rowIndex + 1

    return {
      cells: [
        {
          icon: NumberedMarker(
            rowNumber,
            // marker is purple if in focus mode or waypoint is set
            typeof focusWaypointIndex === 'number' ||
              isCustom ||
              !!selectedWaypoints[rowIndex]
          ),
          label: (
            <div
              className={clsx(
                (isCustom || !!selectedWaypoints[rowIndex]) && 'text-teal-600'
              )}
            >
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
            <div className="flex h-full w-full  items-center">
              <div className="w-11/12">
                {selectedWaypoints[rowIndex] || isCustom ? (
                  <WaypointField
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
                    options={stationOptionsWithCustom}
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
