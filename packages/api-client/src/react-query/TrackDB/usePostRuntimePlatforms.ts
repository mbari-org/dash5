import { useMutation, useQueryClient } from 'react-query'
import {
  PostRuntimePlatformsParams,
  postRuntimePlatforms,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const usePostRuntimePlatforms = (config?: RequestConfig) => {
  const { axiosInstance, token, siteConfig } = useTethysApiContext()
  const queryClient = useQueryClient()
  const odss2dashApi = siteConfig?.appConfig?.odss2dashApi
  const baseURL = config?.baseURL ?? odss2dashApi

  const mutation = useMutation(
    (params: PostRuntimePlatformsParams) => {
      return postRuntimePlatforms(params, {
        ...(config ?? {}),
        instance: config?.instance ?? axiosInstance,
        baseURL,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trackdb', 'platforms'])
        queryClient.invalidateQueries(['trackdb', 'runtime', 'platforms'])
      },
    }
  )
  return mutation
}
