import { useState, useCallback, useEffect } from 'react'
import { useVehicleNames } from './useVehicleNames'
import { useQueryClient } from 'react-query'
import {
  getLastDeployment,
  GetLastDeploymentResponse,
  GetVehicleNamesParams,
} from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useSortedVehicleNames = (params: GetVehicleNamesParams) => {
  const { axiosInstance } = useAuthContext()
  const vehicleNamesQuery = useVehicleNames(params)
  const vehicleNames = vehicleNamesQuery.data ?? []
  const queryClient = useQueryClient()
  const [loadingDeployments, setLoadingDeployments] = useState(false)

  const fetchSortedDeployments = useCallback(async () => {
    console.log('fetchSortedDeployments')
    setLoadingDeployments(true)
    const to = new Date().toISOString()
    await Promise.all(
      vehicleNames.map(
        async (vehicle) =>
          await queryClient.fetchQuery(
            ['deployment', 'last', vehicle],
            () => {
              return getLastDeployment(
                { vehicle, to },
                {
                  instance: axiosInstance,
                }
              )
            },
            {
              staleTime: 60 * 2 * 1000,
            }
          )
      )
    )
    setLoadingDeployments(false)
  }, [vehicleNames, queryClient, axiosInstance, setLoadingDeployments])

  const deploymentQueries = queryClient.getQueriesData(['deployment', 'last'])
  const deployments: { [key: string]: GetLastDeploymentResponse } =
    deploymentQueries.reduce(
      (a, d) => ({ ...a, [d[0][2] as string]: d[1] ?? {} }),
      {}
    )
  const sortedVehicles =
    Object.keys(deployments).length > 0
      ? Object.keys(deployments).sort((a, b) => {
          const depA = deployments[a]
          const depB = deployments[b]
          if (depA.active !== depB.active) {
            return depA.active && !depB.active ? -1 : 1
          }
          if (depA.lastEvent !== depB.lastEvent) {
            return depA.lastEvent > depB.lastEvent ? -1 : 1
          }
          return 0
        })
      : vehicleNames.sort()

  console.log('sortedVehicles', sortedVehicles)
  useEffect(() => {
    fetchSortedDeployments()
  }, [fetchSortedDeployments])

  return {
    data: sortedVehicles,
    isLoading: vehicleNamesQuery.isLoading || loadingDeployments,
  }
}
