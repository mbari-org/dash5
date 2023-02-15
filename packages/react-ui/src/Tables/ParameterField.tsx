import { faCheckSquare } from '@fortawesome/pro-solid-svg-icons'
import { faSquare } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { MouseEvent, useEffect, useState } from 'react'
import { Input, Select } from '../Fields'
import clsx from 'clsx'

export interface ParameterFieldUnit {
  name: string
  abbreviation: string
  baseUnit?: string
}

const getUnitOptions = (name: string, units: ParameterFieldUnit[]) => {
  const defaultUnit = units.find((u) => u.name === name)
  const baseUnit = defaultUnit?.baseUnit || defaultUnit?.name
  let filteredUnits = units
  if (baseUnit) {
    filteredUnits = units.filter(
      (u) => u.baseUnit === baseUnit || u.name === baseUnit
    )
  }
  if (baseUnit === 'second') {
    // a little "exception" to show the long abbreviations at the end.
    filteredUnits = filteredUnits.sort(
      (t, u) => t.abbreviation.length - u.abbreviation.length
    )
  }
  return filteredUnits.map((u) => ({
    name: u.abbreviation ?? u.name,
    id: u.name,
  }))
}

export interface ParameterFieldProps {
  className?: string
  overrideValue?: string
  onOverride: (newOverride: string, overrideUnit: string) => void
  overrideUnit?: string
  unit?: string
  unitOptions?: ParameterFieldUnit[]
  name?: string
  defaultValue: string
}

const styles = {
  container: 'h-[40px] grid grid-cols-3 gap-1 rounded overflow-hidden',
  input: 'flex rounded col-span-2',
  select: 'h-full',
  button: 'h-full w-full bg-white p-1 justify-center flex',
  ruler: 'aspect-square h-full bg-white bg-cover bg-center',
}

export const ParameterField: React.FC<ParameterFieldProps> = ({
  overrideValue,
  overrideUnit,
  onOverride,
  unit,
  unitOptions,
  name,
  defaultValue,
}) => {
  const [inputValue, setInputValue] = useState<string>(overrideValue ?? '')
  const [unitValue, setUnitValue] = useState(overrideUnit ?? unit)

  const lastOverrideValue = React.useRef(overrideValue)
  useEffect(() => {
    if (lastOverrideValue.current !== overrideValue) {
      setInputValue(overrideValue ? overrideValue : '')
      lastOverrideValue.current = overrideValue
    }
  }, [inputValue, overrideValue, lastOverrideValue])

  const handleOverride = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e?.target?.value ?? ''
    setInputValue(newValue)
    onOverride(newValue, unitValue ?? '')
  }

  const handleUnitOverride = (newUnit: string) => {
    setUnitValue(newUnit)
    onOverride(inputValue, newUnit)
  }

  const isTrueFalseField = ['True', 'False'].includes(defaultValue)
  const useCheckbox = unit === 'bool' || isTrueFalseField
  const toggleValues = isTrueFalseField ? ['True', 'False'] : ['1', '0']
  const valueIsNotDefault =
    !!overrideValue && overrideValue.length > 1 && inputValue !== defaultValue
  if (useCheckbox) {
    console.log(
      name,
      overrideValue,
      inputValue,
      defaultValue,
      valueIsNotDefault
    )
  }
  const handleToggle = (e: MouseEvent) => {
    e.preventDefault()
    const checked = inputValue === 'True' || inputValue === '1'
    const newValue = !checked ? toggleValues[0] : toggleValues[1]
    setInputValue(newValue)
    onOverride(newValue, unitValue ?? '')
  }

  return (
    <ul className={styles.container}>
      <li className={styles.input}>
        {useCheckbox ? (
          <button
            onClick={handleToggle}
            className={clsx(
              'flex w-full',
              !valueIsNotDefault && 'text-stone-300'
            )}
          >
            <FontAwesomeIcon
              icon={
                ['True', '1'].includes(inputValue) ? faCheckSquare : faSquare
              }
              size="2xl"
              className="ml-0"
            />
          </button>
        ) : (
          <Input
            name={name ?? 'override'}
            value={inputValue}
            onChange={handleOverride}
          />
        )}
      </li>
      {unit && unitOptions && (
        <li className={styles.select}>
          <Select
            name="overrideUnit"
            options={getUnitOptions(unit, unitOptions)}
            value={unitValue}
            placeholder={unit}
            onSelect={(id) => handleUnitOverride(id ?? unit)}
            disabled={!inputValue}
          />
        </li>
      )}
    </ul>
  )
}
