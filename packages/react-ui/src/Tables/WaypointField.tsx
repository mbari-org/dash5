import clsx from 'clsx'
import React, { useState } from 'react'
import { Input } from '../Fields'
import { Select } from '../Fields/Select'
import { Station, StationOption, WaypointTableProps } from './WaypointTable'

export interface WaypointFieldProps {
  rowIndex: number
  stationOptions?: WaypointTableProps['stations']
  stationName: string | undefined
  lat: string | undefined
  lon: string | undefined
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
  lon,
  stationOptions,
  handleSelect,
  handleUpdate,
  isCustom,
  setIsCustom,
}) => {
  // TODO: real latError and longError error logic goes here
  const latErrorCondition = (lat: number) =>
    customLat && 30 > lat && lat > -37 ? true : false

  const lonErrorCondition = (lon: number) =>
    customLon && 30 > lon && lon > -37 ? true : false

  const [customLat, setCustomLat] = useState<string | undefined>(
    isCustom && lat ? lat : ''
  )
  const [customLon, setCustomLon] = useState<string | undefined>(
    isCustom && lon ? lon : ''
  )
  const [latError, setLatError] = useState<boolean>(
    (isCustom && latErrorCondition(Number(lat))) || false
  )
  const [longError, setLongError] = useState<boolean>(
    (isCustom && lonErrorCondition(Number(lon))) || false
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
    setLatError(latErrorCondition(Number(customLat)))
    setLongError(lonErrorCondition(Number(customLon)))

    if (customLat && customLon) {
      handleUpdate(rowIndex, {
        id: 'Custom',
        name: 'Custom',
        lat: customLat,
        lon: customLon,
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
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
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
          <span className={styles.staticCoordinates}>{lon}</span>
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
