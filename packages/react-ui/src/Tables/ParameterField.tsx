import React, { useEffect, useState } from 'react'
import { Input, Select, SelectOption } from '../Fields'

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

const toBoolString = (v: string | undefined) =>
  v === '1' || v?.toLowerCase() === 'true' ? 'true' : 'false'

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
  container: 'grid grid-cols-3 gap-1 rounded overflow-hidden',
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
    if (lastOverrideValue?.current !== overrideValue) {
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

  const isBoolean = unit === 'bool'

  const boolOptions: SelectOption[] = [
    { id: '1', name: 'true' },
    { id: '0', name: 'false' },
  ]

  const isBoolOverride =
    isBoolean && toBoolString(inputValue) !== toBoolString(defaultValue)

  const handleBoolSelect = (id: string | null) => {
    if (!id) {
      return
    }
    const newVal = id
    setInputValue(newVal)
    onOverride(newVal, unitValue ?? '')
  }

  const boolSelectStyles = {
    singleValue: (base: any) => ({
      ...base,
      color: isBoolOverride ? '#0d9488' : base.color,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isBoolOverride ? '#0d9488' : base.color,
    }),
  }

  return (
    <ul className={styles.container}>
      <li className={styles.input}>
        {isBoolean ? (
          <Select
            name={name ?? 'overrideBool'}
            options={boolOptions}
            value={inputValue || ''}
            placeholder=""
            onSelect={handleBoolSelect}
            styles={boolSelectStyles}
          />
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
            disabled={!inputValue || isBoolean}
          />
        </li>
      )}
    </ul>
  )
}
