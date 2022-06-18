import clsx from 'clsx'
import React, { useState } from 'react'
import { Input } from '../Fields'
import { Select } from '../Fields/Select'
import { Station, StationOption, WaypointTableProps } from './WaypointTable'

export interface WaypointFieldProps {
  rowIndex: number
  stationOptions?: WaypointTableProps['stations']
  stationName: string | undefined
  lat: number | undefined
  long: number | undefined
  handleSelect: (id: string) => void
  handleUpdate: (rowIndex: number, customStation: Station) => void
  isCustom: boolean
  setIsCustom: (isCustom: boolean) => void
}

const styles = {
  ul: 'grid h-full grid-cols-3 gap-1',
  li: 'flex h-full w-full items-center',
  staticCoordinates:
    'flex h-full w-full items-center bg-stone-300 pl-2 overflow-hidden',
  customContainer: 'flex h-full w-full flex-col',
  errorMessage: 'relative -top-2 h-2 text-xs text-red-600',
}

export const WaypointField: React.FC<WaypointFieldProps> = ({
  rowIndex,
  stationName,
  lat,
  long,
  stationOptions,
  handleSelect,
  handleUpdate,
  isCustom,
  setIsCustom,
}) => {
  // TODO: real latError and longError error logic goes here
  const latErrorCondition = (lat: number) =>
    customLat && 30 > lat && lat > -37 ? true : false

  const longErrorCondition = (long: number) =>
    customLong && 30 > long && long > -37 ? true : false

  const [customLat, setCustomLat] = useState<string | undefined>(
    isCustom && lat ? String(lat) : ''
  )
  const [customLong, setCustomLong] = useState<string | undefined>(
    isCustom && long ? String(long) : ''
  )
  const [latError, setLatError] = useState<boolean>(
    (isCustom && latErrorCondition(Number(lat))) || false
  )
  const [longError, setLongError] = useState<boolean>(
    (isCustom && longErrorCondition(Number(long))) || false
  )

  const options: StationOption[] | undefined = stationOptions?.map(
    ({ name }) => ({ id: name, name })
  )
  const optionsWithCustom: StationOption[] | undefined = (options &&
    [{ id: 'Custom', name: 'Custom' }].concat(options)) || [
    { id: 'Custom', name: 'Custom' },
  ]

  // TODO: add bad input error handling
  const handleCustom = () => {
    const newLat = Number(customLat)
    const newLong = Number(customLong)

    setLatError(latErrorCondition(newLat))
    setLongError(longErrorCondition(newLong))

    if (customLat && customLong) {
      handleUpdate(rowIndex, {
        id: 'Custom',
        name: 'Custom',
        lat: newLat,
        long: newLong,
      })
    }
  }

  return (
    <ul className={styles.ul}>
      <li className={styles.li}>
        {isCustom ? (
          <div className={styles.customContainer}>
            {latError && <div className={styles.errorMessage}>+/- error?</div>}
            <Input
              name={'latInput'}
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              onBlur={() => {
                handleCustom()
              }}
              className={clsx(
                'text-teal-600',
                latError && 'h-4 border-red-600'
              )}
            />
          </div>
        ) : (
          <span className={styles.staticCoordinates}>{lat}</span>
        )}
      </li>
      <li className={styles.li}>
        {isCustom ? (
          <div className={styles.customContainer}>
            {longError && <div className={styles.errorMessage}>+/- error?</div>}
            <Input
              name={'longInput'}
              value={customLong}
              onChange={(e) => setCustomLong(e.target.value)}
              onBlur={() => {
                handleCustom()
              }}
              className={clsx(
                'text-teal-600',
                longError && 'h-4 border-red-600'
              )}
            />
          </div>
        ) : (
          <span className={styles.staticCoordinates}>{long}</span>
        )}
      </li>
      <li className={clsx(styles.li)}>
        <Select
          value={isCustom ? 'Custom' : stationName}
          name="waypoint selector"
          options={optionsWithCustom}
          onSelect={(id) => {
            id === 'Custom' ? setIsCustom(true) : setIsCustom(false)
            id !== 'Custom' && id && handleSelect(id)
          }}
        />
      </li>
    </ul>
  )
}

WaypointField.displayName = 'Tables.WaypointField'
