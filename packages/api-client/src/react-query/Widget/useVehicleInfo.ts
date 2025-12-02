import { AxiosInstance } from 'axios'
import { useQuery } from 'react-query'
import {
  getVehicleInfo,
  GetVehicleInfoParams,
  GetVehicleInfoResponse,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'
import { useSiteConfig } from '../Info/useSiteConfig'
import axios from 'axios'
import { useMemo } from 'react'

export interface UseVehicleInfoOptions extends SupportedQueryOptions {
  refetchInterval?: number
}

/**
 * This endpoint does not come from the tethys API, instead it is a placeholder for the formal API and
 * is populate by the same cron job that generates the legacy SSR SVG diagrams for the V1 dash. I recommend
 * contacting the maintainer or referencing the code for said cron job here:
 * https://bitbucket.org/beroe/auvstatus/src/master/
 */
export const useVehicleInfo = (
  params: GetVehicleInfoParams,
  instance?: AxiosInstance,
  options?: UseVehicleInfoOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const { data: siteConfig } = useSiteConfig()

  const refetchInterval = options?.refetchInterval
  const supportedOptions: SupportedQueryOptions = options
    ? {
        staleTime: options.staleTime,
        enabled: options.enabled,
        baseUrl: options.baseUrl,
        refetchOnWindowFocus: options.refetchOnWindowFocus,
        refetchOnReconnect: options.refetchOnReconnect,
      }
    : {}

  // Construct fallback URL from siteConfig pattern
  const fallbackVehicleInfoUrl = useMemo(() => {
    const pattern =
      siteConfig?.appConfig.external.statusWidgets?.lrauvStatusWidgetUrlPattern
    if (!pattern) return null
    // Replace <vehicleName> or <VehicleName> with actual name and change .svg to .json
    return pattern
      .replace(/<vehicleName>/gi, params.name)
      .replace('.svg', '.json')
  }, [
    siteConfig?.appConfig.external.statusWidgets?.lrauvStatusWidgetUrlPattern,
    params.name,
  ])

  // Try original API endpoint first
  const primaryVehicleInfo = useQuery(
    ['widget', params.name],
    () => {
      return getVehicleInfo(params, {
        instance: instance ?? axiosInstance,
      })
    },
    {
      staleTime: supportedOptions?.staleTime ?? 0,
      enabled: supportedOptions?.enabled !== false && !!params.name,
      ...supportedOptions,
    }
  )

  // Fallback to siteConfig URL if primary fails (particularly useful for local development)
  const { data: fallbackVehicleInfo } = useQuery(
    ['vehicleInfoFallback', params.name, fallbackVehicleInfoUrl],
    async () => {
      if (!fallbackVehicleInfoUrl)
        return { not_found: true } as GetVehicleInfoResponse
      try {
        const response = await axios.get(fallbackVehicleInfoUrl, {
          timeout: 5000,
        })
        return response.data as GetVehicleInfoResponse
      } catch (e: unknown) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          return { not_found: true } as GetVehicleInfoResponse
        }
        throw e
      }
    },
    {
      enabled:
        !!fallbackVehicleInfoUrl &&
        !!params.name &&
        (primaryVehicleInfo.isError ||
          primaryVehicleInfo.data?.not_found ||
          (!primaryVehicleInfo.data && !primaryVehicleInfo.isLoading)),
      staleTime: supportedOptions?.staleTime ?? 0,
      refetchInterval: refetchInterval ?? 30 * 1000,
    }
  )

  const vehicleInfo =
    primaryVehicleInfo.data && !primaryVehicleInfo.data.not_found
      ? primaryVehicleInfo.data
      : fallbackVehicleInfo

  const vehicleInfoLoading =
    primaryVehicleInfo.isLoading ||
    (fallbackVehicleInfo === undefined && !!fallbackVehicleInfoUrl)

  return {
    ...primaryVehicleInfo,
    data: vehicleInfo,
    isLoading: vehicleInfoLoading,
  }
}
