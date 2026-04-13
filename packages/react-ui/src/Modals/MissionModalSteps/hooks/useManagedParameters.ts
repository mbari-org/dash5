import { useState, useMemo, useEffect, useRef } from 'react'
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
  selectionKey,
}: {
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  defaultOverrides?: ParameterProps[]
  selectionKey?: string | null
}) => {
  // Local state: only the user overrides. Base parameter arrays remain props.
  const [overrideMap, setOverrideMap] = useState<
    Record<string, { value: string; unit?: string }>
  >(() => buildOverrideMap(defaultOverrides))

  // Track whether the user has changed any parameter values.
  // If they haven't, we can safely re-sync `overrideMap` when `defaultOverrides`
  // updates asynchronously (e.g. frequent runs finishing override parsing).
  const hasUserModifiedRef = useRef(false)
  const isFirstSelectionKeyEffect = useRef(true)

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
    setOverrideMap((m) => {
      hasUserModifiedRef.current = true
      return {
        ...m,
        [key]: { value: overrideValue, unit: overrideUnit },
      }
    })

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

  // Switching mission selection clears local overrides so we don't keep another run's edits.
  useEffect(() => {
    if (isFirstSelectionKeyEffect.current) {
      isFirstSelectionKeyEffect.current = false
      return
    }
    hasUserModifiedRef.current = false
    setOverrideMap({})
  }, [selectionKey])

  // Re-sync overrides when defaultOverrides changes (e.g. frequent runs finishing
  // override parsing), unless the user has already started editing.
  useEffect(() => {
    if (!defaultOverrides?.length) {
      if (!hasUserModifiedRef.current) setOverrideMap({})
      return
    }

    // Re-sync only if user hasn't started editing.
    if (!hasUserModifiedRef.current) {
      setOverrideMap(buildOverrideMap(defaultOverrides))
    }
  }, [defaultOverrides])

  // Reset the initial overrides
  const resetOverrides = () => {
    hasUserModifiedRef.current = false
    setOverrideMap({})
  }

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
