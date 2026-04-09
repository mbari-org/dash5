import { useMemo } from 'react'
import { ParameterProps } from '@mbari/react-ui'
import { getUnitFromAbbreviation } from '@mbari/utils'
import {
  GetScriptResponse,
  ScriptArgument,
  ScriptInsert,
  useUnits,
} from '@mbari/api-client'
import { Mission } from '@mbari/react-ui'

const insertForParameter = (
  argument: ScriptArgument,
  inserts: ScriptInsert[]
) => {
  const insert = inserts.find((i) => i.scriptArgs.includes(argument))
  if (insert) {
    return insert.id
  }
  return null
}

export const useParameterOverrides = (params: {
  selectedMissionData?: GetScriptResponse
  selectedMission?: string
  selectedMissionCategory?: string
  runsWithOverrides: Mission[]
}) => {
  const {
    selectedMissionData,
    selectedMission,
    selectedMissionCategory,
    runsWithOverrides,
  } = params

  const { data: unitsData } = useUnits()

  const { reservedInserts, normalInserts } = useMemo(() => {
    const all = selectedMissionData?.inserts ?? []
    return {
      reservedInserts: all.filter(({ id }) => /(comms|envelope)/i.test(id)),
      normalInserts: all.filter(({ id }) => !/(comms|envelope)/i.test(id)),
    }
  }, [selectedMissionData])

  const reservedInsertIdsLower = useMemo(
    () => reservedInserts.map(({ id }) => id.toLowerCase()),
    [reservedInserts]
  )

  // Waypoint parameter names (lat/lon pairs)
  const waypointParamNames: string[] = useMemo(
    () =>
      selectedMissionData?.latLonNamePairs?.flatMap(({ latName, lonName }) => [
        latName,
        lonName,
      ]) ?? [],
    [selectedMissionData]
  )

  const commsInsert = selectedMissionData?.inserts?.find(({ id }) =>
    id.match(/comms/i)
  )
  const safetyInsert = selectedMissionData?.inserts?.find(({ id }) =>
    id.match(/envelope/i)
  )

  const parameters: ParameterProps[] = useMemo(() => {
    if (!selectedMissionData) return []

    const sourceArgs = [
      selectedMissionData.scriptArgs ?? [],
      ...normalInserts.flatMap((ins) => ins.scriptArgs ?? []),
    ].flat()

    // Deduplicate by insertId and name to avoid duplicates between root and insert lists
    const uniqMap = new Map<
      string,
      ScriptArgument & { insert?: string | null }
    >()
    sourceArgs.forEach((arg) => {
      const insertId = insertForParameter(
        arg,
        selectedMissionData.inserts ?? []
      )
      const key = `${insertId ?? ''}:${arg.name}`
      if (!uniqMap.has(key)) {
        uniqMap.set(key, { ...arg, insert: insertId })
      }
    })

    return Array.from(uniqMap.values())
      .filter(
        (a) =>
          !waypointParamNames.includes(a.name) &&
          !reservedInsertIdsLower.includes((a.insert ?? '').toLowerCase())
      )
      .map(
        (a) =>
          ({
            description: a.description ?? '',
            name: a.name,
            unit: a.unit,
            value: a.value,
            insert: a.insert,
          } as ParameterProps)
      )
  }, [
    selectedMissionData,
    normalInserts,
    waypointParamNames,
    reservedInsertIdsLower,
  ])

  const parametersWithOverrides: ParameterProps[] = useMemo(() => {
    if (
      (selectedMissionCategory === 'Recent Runs' ||
        selectedMissionCategory === 'Frequent Runs') &&
      selectedMission &&
      parameters.length
    ) {
      const selectedRun = runsWithOverrides.find(
        (r) => r.id === selectedMission
      ) as any

      if (selectedRun?.parameterOverrides?.length) {
        return parameters.map((p) => {
          const ov = selectedRun.parameterOverrides.find(
            (o: { name: string; insert?: string }) => {
              if (o.name !== p.name) return false
              const norm = (v?: string) =>
                (v ?? '').replace(/\s+/g, '').toLowerCase()
              return norm(o.insert) === norm(p.insert)
            }
          )
          if (ov) {
            const updated: ParameterProps = { ...p }
            if (ov.value !== undefined) {
              updated.overrideValue = ov.value
            }
            if (ov.unit) {
              const fullUnitName = getUnitFromAbbreviation(ov.unit, unitsData)
              if (fullUnitName && fullUnitName !== p.unit) {
                updated.overrideUnit = fullUnitName
              }
            }
            return updated
          }
          return p
        })
      }
    }
    return parameters
  }, [
    selectedMissionCategory,
    selectedMission,
    runsWithOverrides,
    parameters,
    unitsData,
  ])

  const commsParams = useMemo(
    () =>
      commsInsert?.scriptArgs.map((i) => ({ ...i, insert: commsInsert.id })) ??
      [],
    [commsInsert]
  )

  const safetyParams = useMemo(
    () =>
      safetyInsert?.scriptArgs.map((i) => ({
        ...i,
        insert: safetyInsert.id,
      })) ?? [],
    [safetyInsert]
  )

  // Apply parameter overrides to communications parameters
  const commsParamsWithOverrides: ParameterProps[] = useMemo(() => {
    if (
      (selectedMissionCategory === 'Recent Runs' ||
        selectedMissionCategory === 'Frequent Runs') &&
      selectedMission &&
      commsParams.length
    ) {
      const selectedRun = runsWithOverrides.find(
        (r) => r.id === selectedMission
      ) as any

      if (selectedRun?.parameterOverrides?.length) {
        return commsParams.map((p) => {
          const ov = selectedRun.parameterOverrides.find(
            (o: { name: string; insert?: string }) => {
              if (o.name !== p.name) return false
              const norm = (v?: string) =>
                (v ?? '').replace(/\s+/g, '').toLowerCase()
              return norm(o.insert) === norm(p.insert)
            }
          )
          if (ov) {
            const updated: ParameterProps = { ...p }
            if (ov.value !== undefined) {
              updated.overrideValue = ov.value
            }
            if (ov.unit) {
              const fullUnitName = getUnitFromAbbreviation(ov.unit, unitsData)
              if (fullUnitName && fullUnitName !== p.unit) {
                updated.overrideUnit = fullUnitName
              }
            }
            return updated
          }
          return p
        })
      }
    }
    return commsParams
  }, [
    selectedMissionCategory,
    selectedMission,
    runsWithOverrides,
    commsParams,
    unitsData,
  ])

  // Apply parameter overrides to safety parameters
  const safetyParamsWithOverrides: ParameterProps[] = useMemo(() => {
    if (
      (selectedMissionCategory === 'Recent Runs' ||
        selectedMissionCategory === 'Frequent Runs') &&
      selectedMission &&
      safetyParams.length
    ) {
      const selectedRun = runsWithOverrides.find(
        (r) => r.id === selectedMission
      ) as any

      if (selectedRun?.parameterOverrides?.length) {
        return safetyParams.map((p) => {
          const ov = selectedRun.parameterOverrides.find(
            (o: { name: string; insert?: string }) => {
              if (o.name !== p.name) return false
              const norm = (v?: string) =>
                (v ?? '').replace(/\s+/g, '').toLowerCase()
              return norm(o.insert) === norm(p.insert)
            }
          )
          if (ov) {
            const updated: ParameterProps = { ...p }
            if (ov.value !== undefined) {
              updated.overrideValue = ov.value
            }
            if (ov.unit) {
              const fullUnitName = getUnitFromAbbreviation(ov.unit, unitsData)
              if (fullUnitName && fullUnitName !== p.unit) {
                updated.overrideUnit = fullUnitName
              }
            }
            return updated
          }
          return p
        })
      }
    }
    return safetyParams
  }, [
    selectedMissionCategory,
    selectedMission,
    runsWithOverrides,
    safetyParams,
    unitsData,
  ])

  return {
    parameters,
    safetyParams,
    commsParams,
    parametersWithOverrides,
    commsParamsWithOverrides,
    safetyParamsWithOverrides,
  }
}
