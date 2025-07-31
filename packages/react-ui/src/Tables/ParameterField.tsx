import React, { useEffect, useState } from 'react'
import { Input, Select, SelectOption } from '../Fields'
import { useDebouncedEffect } from '@mbari/utils'

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
  onOverride: (newOverride: string, overrideUnit?: string) => void
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
  const [isEditing, setIsEditing] = useState(false)

  // Pull external changes into the local draft when the user is *not* editing.
  useEffect(() => {
    if (!isEditing) {
      setInputValue(overrideValue ?? '')
    }
  }, [overrideValue, isEditing])

  useEffect(() => {
    if (!isEditing) {
      setUnitValue(overrideUnit ?? unit)
    }
  }, [overrideUnit, unit, isEditing])

  // Update the override after user stops typing for 400ms
  useDebouncedEffect(
    () => {
      if (isEditing) {
        const valueChanged = inputValue !== (overrideValue ?? '')
        const unitChanged = unitValue !== (overrideUnit ?? unit)

        if (valueChanged || unitChanged) {
          onOverride(inputValue, unitValue ?? '')
        }
        setIsEditing(false)
      }
    },
    400,
    [inputValue, unitValue]
  )

  const handleOverride = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e?.target?.value ?? ''
    setIsEditing(true)
    setInputValue(newValue)
  }

  const handleUnitOverride = (newUnit: string) => {
    setIsEditing(true)
    setUnitValue(newUnit)
  }

  const isBoolean = unit === 'bool'

  const boolOptions: SelectOption[] = [
    { id: '1', name: 'true' },
    { id: '0', name: 'false' },
  ]

  const isUnitOverride =
    (isBoolean && toBoolString(inputValue) !== toBoolString(defaultValue)) ||
    (overrideUnit && overrideUnit !== unit)

  const handleBoolSelect = (id: string | null) => {
    if (!id) {
      return
    }
    const newVal = id
    setIsEditing(true)
    setInputValue(newVal)
  }

  const unitSelectStyles = {
    singleValue: (base: any) => ({
      ...base,
      color: isUnitOverride ? '#0d9488' : base.color,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isUnitOverride ? '#0d9488' : base.color,
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
            styles={unitSelectStyles}
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
            styles={unitSelectStyles}
          />
        </li>
      )}
    </ul>
  )
}
