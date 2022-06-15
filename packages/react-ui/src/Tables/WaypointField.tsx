import clsx from 'clsx'
import React, { useState } from 'react'
import { Input } from '../Fields'
import { Select } from '../Fields/Select'
import { Station, WaypointTableProps } from './WaypointTable'

export interface WaypointFieldProps {
  stationOptions?: WaypointTableProps['stations']
  stationName: string | undefined
  lat: number | undefined
  long: number | undefined
  handleSelect: (id: string) => void
  handleUpdate: (customStation: Station) => void
  isCustom: boolean
  setIsCustom: (isCustom: boolean) => void
}

const styles = {
  ul: 'grid h-full grid-cols-3 gap-1',
  li: 'flex h-full w-full items-center',
  setCoordinates: 'items-center border-[1px] border-stone-300 pl-1',
  customContainer: 'flex h-full w-full flex-col',
  errorMessage: 'relative -top-2 h-2 text-xs text-red-600',
}

export const WaypointField: React.FC<WaypointFieldProps> = ({
  stationName,
  lat,
  long,
  stationOptions,
  handleSelect,
  handleUpdate,
  isCustom,
  setIsCustom,
}) => {
  const [customLat, setCustomLat] = useState<string | undefined>('')
  const [customLong, setCustomLong] = useState<string | undefined>('')
  const [latError, setLatError] = useState<boolean>(false)
  const [longError, setLongError] = useState<boolean>(false)

  const options = stationOptions?.map(({ name }) => ({ id: name, name }))
  const optionsWithCustom =
    options && [{ id: 'Custom', name: 'Custom' }].concat(options)

  const updateCoordinateErrors = (lat: number, long: number) => {
    if (customLat && 30 > lat && lat > -30) {
      setLatError(true)
    }
    if (!customLat || 30 < lat || lat < -30) {
      setLatError(false)
    }

    if (customLong && 30 > long && long > -30) {
      setLongError(true)
    }
    if (!customLong || 30 < long || long < -30) {
      setLongError(false)
    }
  }

  const handleCustom = () => {
    const newLat = Number(customLat)
    const newLong = Number(customLong)
    console.log(customLat)

    // TODO: real latError and longError error logic goes here
    updateCoordinateErrors(newLat, newLong)

    if (customLat && customLong) {
      handleUpdate({
        id: 'Custom',
        name: 'Custom',
        lat: newLat,
        long: newLong,
      })
    }
  }

  return (
    <ul className={styles.ul}>
      <li
        className={clsx(
          styles.li,
          !isCustom && styles.setCoordinates,
          lat && !isCustom && 'bg-stone-300'
        )}
      >
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
          <div className="pl-2">{lat}</div>
        )}
      </li>
      <li
        className={clsx(
          styles.li,
          !isCustom && styles.setCoordinates,
          long && !isCustom && 'bg-stone-300'
        )}
      >
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
          <span className="pl-2">{long}</span>
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
