import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { getLastDeployment, GetLastDeploymentResponse } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { useSiteConfig } from './useSiteConfig'

export const useSortedVehicleNames = () => {
  const { axiosInstance } = useTethysApiContext()
  const { data: vehiclesInfo, isLoading: isLoadingVehiclesInfo } =
    useSiteConfig({})
  const vehicles = useMemo(
    () => vehiclesInfo?.vehicleBasicInfos ?? [],
    [vehiclesInfo]
  )
  const queryClient = useQueryClient()
  const [loadingDeployments, setLoadingDeployments] = useState(false)

  const fetchSortedDeployments = useCallback(async () => {
    setLoadingDeployments(true)
    await Promise.all(
      vehicles.map(
        async ({ vehicleName }) =>
          await queryClient.fetchQuery(
            ['deployment', 'last', vehicleName],
            () => {
              return getLastDeployment(
                { vehicle: vehicleName },
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
  }, [vehicles, queryClient, axiosInstance, setLoadingDeployments])

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
          if (depA.present !== depB.present) {
            return depA.present && !depB.present ? -1 : 1
          }
          if (depA.active !== depB.active) {
            return depA.active && !depB.active ? -1 : 1
          }
          if (depA.lastEvent !== depB.lastEvent) {
            return depA.lastEvent > depB.lastEvent ? -1 : 1
          }
          return 0
        })
      : vehicles.map((v) => v.vehicleName).sort()

  useEffect(() => {
    fetchSortedDeployments()
  }, [fetchSortedDeployments])

  return {
    data: sortedVehicles
      .map((vehicleName, position) => ({
        ...vehicles.find((v) => v.vehicleName === vehicleName),
        position,
      }))
      .sort((a, b) => a.position - b.position),
    isLoading: isLoadingVehiclesInfo || loadingDeployments,
  }
}
