import { useMemo } from 'react'
import { useQuery } from 'react-query'
import {
  extractOverridesWithScriptMetadata,
  generateMissionKey,
  getFrequentRuns,
  getScript,
} from '../../axios'
import { createLimiter } from '../../axios/Util/concurrencyLimiter'
import { parseMissionPathFromCommand } from '../../axios/Util/parseMissionPathFromCommand'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'
import type { NormalizedMissionRun } from './types'

export interface UseFrequentRunsParams {
  vehicles: string[]
  gitRef: string
  limit?: number
}

export const useFrequentRuns = (
  params: UseFrequentRunsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const { vehicles, gitRef, limit } = params
  // Sort and dedupe so the query key and the fetch are both deterministic
  // regardless of the order callers pass vehicles.
  const normalizedVehicles = useMemo(
    () => [...new Set([...vehicles].sort((a, b) => a.localeCompare(b)))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicles.join(',')]
  )
  const vehicleKey = normalizedVehicles.join(',')

  const query = useQuery(
    [
      'command',
      'commands',
      'frequent',
      'runs',
      'normalized',
      vehicleKey,
      gitRef,
      limit ?? null,
    ],
    async (): Promise<NormalizedMissionRun[]> => {
      const limitScriptFetch = createLimiter(1)
      const scriptRequestByMission = new Map<
        string,
        ReturnType<typeof getScript>
      >()

      const getScriptMetadata = (missionPath: string) => {
        let request = scriptRequestByMission.get(missionPath)
        if (!request) {
          request = limitScriptFetch(() =>
            getScript(
              { path: missionPath, gitRef },
              {
                instance: axiosInstance,
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          ) as ReturnType<typeof getScript>
          scriptRequestByMission.set(missionPath, request)
        }
        return request
      }

      const batches = await Promise.all(
        normalizedVehicles.map(async (vehicle) => {
          const writtenCommands = await getFrequentRuns(
            { vehicle, limit },
            { instance: axiosInstance }
          )

          const runs = await Promise.all(
            writtenCommands.map(async (writtenCommand) => {
              const missionPath = parseMissionPathFromCommand(writtenCommand)
              if (!missionPath) return undefined

              const { waypointOverrides, parameterOverrides } =
                await extractOverridesWithScriptMetadata(
                  writtenCommand,
                  missionPath,
                  () => getScriptMetadata(missionPath),
                  { logContext: missionPath }
                )

              const selectionId = generateMissionKey({
                missionName: missionPath,
                waypointOverrides,
                parameterOverrides,
              })

              const run: NormalizedMissionRun = {
                selectionId,
                missionPath,
                writtenCommand,
                waypointOverrides,
                parameterOverrides,
                waypointCount: waypointOverrides.length,
                parameterCount: parameterOverrides.length,
                vehicle,
              }
              return run
            })
          )

          return runs.filter(Boolean) as NormalizedMissionRun[]
        })
      )

      return batches.flat()
    },
    {
      staleTime: 60 * 1000,
      ...options,
      enabled: (options?.enabled ?? true) && vehicles.length > 0 && !!gitRef,
    }
  )

  return {
    ...query,
    isLoading: query.isLoading,
  }
}
