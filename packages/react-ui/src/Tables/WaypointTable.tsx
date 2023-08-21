import React, { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select } from '../Fields/Select'
import { Button, IconButton } from '../Navigation'
import { faLocationDot, faLocationPin } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { swallow } from '@mbari/utils'
import { WaypointField } from './WaypointField'

export interface WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  waypoints: WaypointProps[]
  stations?: Station[]
  focusedWaypointIndex?: number | null
  grayHeader?: boolean
  onFocusWaypoint?: (index?: number | null) => void
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

const NumberedMarker: React.FC<{ num: number; isActive?: boolean }> = ({
  num,
  isActive,
}) => {
  return (
    <div
      className="relative mr-2 p-4"
      aria-label={`Number ${num} map marker icon`}
    >
      <div className={styles.absoluteAndCentered}>
        <FontAwesomeIcon
          icon={faLocationPin as IconProp}
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

const filterCustomWaypointIndices = (waypoints: WaypointProps[]) =>
  waypoints.reduce(
    (acc, waypoint, index) =>
      waypoint.stationName === 'Custom' ? [...acc, index] : acc,
    [] as number[]
  )

export const WaypointTable: React.FC<WaypointTableProps> = ({
  className,
  style,
  waypoints,
  stations,
  focusedWaypointIndex,
  grayHeader,
  onFocusWaypoint,
  onCancelFocus,
  onDone,
  onUpdate,
}) => {
  const [initialWaypoints, setInitialWaypoints] =
    useState<WaypointProps[]>(waypoints)
  const [selectedWaypoints, setSelectedWaypoints] =
    useState<WaypointProps[]>(waypoints)
  const [customWaypoints, setCustomWaypoints] = useState<number[]>(
    filterCustomWaypointIndices(waypoints)
  )

  useEffect(() => {
    if (initialWaypoints !== waypoints) {
      setSelectedWaypoints(waypoints)
      setInitialWaypoints(waypoints)
      setCustomWaypoints(filterCustomWaypointIndices(waypoints))
    }
  }, [waypoints, selectedWaypoints, initialWaypoints, setCustomWaypoints])

  const updateSelectedWaypoints = useCallback(
    (indexToChange: number, selected: Station) => {
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
    },
    [waypoints, selectedWaypoints, onUpdate]
  )

  const handleCancel = onCancelFocus
    ? () => {
        typeof focusedWaypointIndex === 'number' &&
          onCancelFocus?.(focusedWaypointIndex)
      }
    : undefined

  const selectOptions: StationOption[] | undefined = stations?.map(
    ({ name, lat, lon }) => ({
      id: name,
      name: `${name} ${lat}, ${lon}`,
    })
  )

  const selectOptionsWithCustom: StationOption[] | undefined = [
    { id: 'Custom', name: 'Custom' },
    { id: 'NaN', name: 'NaN' },
  ].concat(selectOptions ?? [])

  const makeRow = useCallback(
    (rowIndex: number) => {
      const rowNumber = rowIndex + 1
      const activeRow =
        typeof focusedWaypointIndex === 'number' ||
        !!selectedWaypoints[rowIndex]?.stationName

      const selectedWaypoint = selectedWaypoints[rowIndex] ?? {}
      const { latName, lonName, description } = waypoints[rowIndex] ?? {}

      const isCustom = customWaypoints.includes(rowIndex)
      const setIsCustom = (value: boolean) => {
        if (value && !isCustom) {
          setCustomWaypoints([...customWaypoints, rowIndex])
        }
        if (!value && isCustom) {
          setCustomWaypoints(customWaypoints.filter((i) => i !== rowIndex))
        }
      }

      const handleFocusWaypoint = () => {
        onFocusWaypoint?.(rowIndex)
      }

      const handleSelectStation = (id: string) => {
        if (id === 'NaN') {
          updateSelectedWaypoints(rowIndex, {
            name: 'Custom',
            lat: 'NaN',
            lon: 'NaN',
          })
          return
        }
        const selectedStation = stations?.find(({ name }) => name === id)

        selectedStation && updateSelectedWaypoints(rowIndex, selectedStation)
      }

      return {
        cells: [
          {
            icon: <NumberedMarker num={rowNumber} isActive={activeRow} />,
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
                  {selectedWaypoint.lat || selectedWaypoint.lon || isCustom ? (
                    <WaypointField
                      rowIndex={rowIndex}
                      stationName={selectedWaypoint?.stationName}
                      lat={selectedWaypoint?.lat}
                      lon={selectedWaypoint?.lon}
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
                    icon={faLocationDot}
                    ariaLabel={'Map marker button'}
                    className={clsx(styles.iconButton, 'rounded-lg')}
                    style={{ height: '2.5rem', width: '2.5rem' }}
                    size="text-2xl"
                    noPadding
                    onClick={handleFocusWaypoint}
                    disabled={rowIndex === focusedWaypointIndex}
                  />
                </div>
              </div>
            ),
          },
        ],
      }
    },
    [
      focusedWaypointIndex,
      selectedWaypoints,
      customWaypoints,
      waypoints,
      selectOptionsWithCustom,
      stations,
      onFocusWaypoint,
      updateSelectedWaypoints,
    ]
  )

  const waypointRows = waypoints.map((_, index) => {
    return makeRow(index)
  })

  return (
    <>
      {typeof focusedWaypointIndex === 'number' ? (
        <ul className="bg-white p-2">
          <li className="py-2 pl-8 font-semibold">
            Place the location pin to set Lat{focusedWaypointIndex + 1}/Lon
            {focusedWaypointIndex + 1}
          </li>
          <li>
            <Table rows={[makeRow(focusedWaypointIndex)]} scrollable />
          </li>
          <li className="flex justify-end py-2 pr-4">
            {handleCancel ? (
              <Button
                appearance="secondary"
                onClick={swallow(handleCancel)}
                aria-label="cancel"
                className="mr-2"
              >
                Cancel
              </Button>
            ) : null}
            {onDone ? (
              <Button appearance="primary" onClick={swallow(onDone)}>
                Done
              </Button>
            ) : null}
          </li>
        </ul>
      ) : (
        <Table
          className={className}
          style={style}
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
    </>
  )
}

WaypointTable.displayName = 'Tables.WaypointTable'
