import { useMemo } from 'react'
import { useEvents, type GetEventsResponse } from '@mbari/api-client'
import { getAdjustedUnixTime } from '@mbari/utils'
import {
  parseNeedCommsSelection,
  parseMissionNameSelection,
} from './parseNeedComms'
import { needCommsMissionDefaults } from './needCommsMissionDefaults'

export const useNeedCommsTime = (
  vehicleName?: string | null,
  missionStartTimeMs?: number | null,
  options?: { enabled?: boolean }
) => {
  const from = useMemo(() => {
    if (!missionStartTimeMs) return null
    return (
      getAdjustedUnixTime({ unixTime: missionStartTimeMs, offsetDays: 0 }) -
      60_000
    )
  }, [missionStartTimeMs])

  const { data, isLoading, isFetching } = useEvents(
    {
      vehicles: vehicleName ? [vehicleName] : [],
      eventTypes: ['logImportant'],
      from: from ?? 0,
      limit: 2000,
    },
    {
      enabled:
        Boolean(vehicleName) &&
        Boolean(missionStartTimeMs) &&
        Boolean(from) &&
        (options?.enabled ?? true),
    }
  )

  const minutes = useMemo(() => {
    if (!data || data.length === 0) return null

    const selection = parseNeedCommsSelection(data as GetEventsResponse[])
    const parsed = selection.minutes
    if (parsed) return parsed

    const missionSel = parseMissionNameSelection(data as GetEventsResponse[])
    const missionKeyCandidates: string[] = []
    if (missionSel.missionName) {
      missionKeyCandidates.push(
        missionSel.missionName,
        missionSel.missionName.replace(/\s+/g, '_'),
        missionSel.missionName.replace(/\s+/g, '').toLowerCase()
      )
    }

    for (const k of missionKeyCandidates) {
      if (needCommsMissionDefaults[k] !== undefined) {
        return needCommsMissionDefaults[k]
      }
    }
    return null
  }, [data])

  return {
    minutes,
    isLoading: isLoading || isFetching,
  }
}
