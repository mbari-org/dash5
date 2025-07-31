import { useState, useMemo, useEffect } from 'react'
import {
  ParameterProps,
  ParameterTableProps,
} from '../../../Tables/ParameterTable'

// Lookup map for initial overrides (these are the overrides applied by whoever previously ran this mission if this is a recent run)
const buildOverrideMap = (list?: ParameterProps[]) => {
  const map: Record<string, { value: string; unit?: string }> = {}
  list?.forEach(({ name, overrideValue, overrideUnit, insert }) => {
    if (overrideValue !== undefined && overrideValue !== null) {
      const key = insert ? `${insert}:${name}` : name
      map[key] = {
        value: overrideValue,
        unit: overrideUnit,
      }
    }
  })
  return map
}

const applyOverrides = (
  params: ParameterProps[],
  overrides: Record<string, { value: string; unit?: string }>
) =>
  params.map((p) => {
    const key = p.insert ? `${p.insert}:${p.name}` : p.name
    const ov = overrides[key]
    return ov?.value
      ? { ...p, overrideValue: ov.value, overrideUnit: ov?.unit ?? undefined }
      : p
  })

const useManagedParameters = ({
  parameters,
  safetyParams,
  commsParams,
  defaultOverrides,
}: {
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  defaultOverrides?: ParameterProps[]
}) => {
  // Local state: only the user overrides. Base parameter arrays remain props.
  const [overrideMap, setOverrideMap] = useState<
    Record<string, { value: string; unit?: string }>
  >(() => buildOverrideMap(defaultOverrides))

  // Re-derive parameter lists whenever overrides or base lists change.
  const updatedParameters = useMemo(
    () => applyOverrides(parameters, overrideMap),
    [parameters, overrideMap]
  )
  const updatedSafetyParams = useMemo(
    () => applyOverrides(safetyParams, overrideMap),
    [safetyParams, overrideMap]
  )
  const updatedCommsParams = useMemo(
    () => applyOverrides(commsParams, overrideMap),
    [commsParams, overrideMap]
  )

  // Unified handler for all param categories
  const updateOverride = (
    key: string,
    overrideValue: string,
    overrideUnit?: string
  ) =>
    setOverrideMap((m) => ({
      ...m,
      [key]: { value: overrideValue, unit: overrideUnit },
    }))

  const handleParamUpdate: ParameterTableProps['onParamUpdate'] = (
    key,
    value,
    unit
  ) => {
    updateOverride(key, value, unit)
  }

  const handleSafetyUpdate: ParameterTableProps['onParamUpdate'] = (
    key,
    value,
    unit
  ) => updateOverride(key, value, unit)

  const handleCommsUpdate: ParameterTableProps['onParamUpdate'] = (
    key,
    value,
    unit
  ) => updateOverride(key, value, unit)

  const safetyCommsParams = [...updatedSafetyParams, ...updatedCommsParams]
  const overriddenMissionParams = updatedParameters.filter(
    (p) => p.overrideValue
  )
  const overrideCount =
    safetyCommsParams.filter((p) => p.overrideValue).length +
    overriddenMissionParams.length

  // Initialize overrides once
  useEffect(() => {
    if (defaultOverrides?.length && Object.keys(overrideMap).length === 0) {
      setOverrideMap(buildOverrideMap(defaultOverrides))
    }
  }, [defaultOverrides, overrideMap])

  // Reset the initial overrides
  const resetOverrides = () => setOverrideMap({})

  return {
    handleCommsUpdate,
    handleParamUpdate,
    handleSafetyUpdate,
    safetyCommsParams,
    updatedCommsParams,
    updatedParameters,
    updatedSafetyParams,
    overrideCount,
    overriddenMissionParams,
    resetOverrides,
  }
}

export default useManagedParameters
