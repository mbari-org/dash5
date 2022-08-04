import { useMutation } from 'react-query'
import {
  DetachDocumentToDeploymentParams,
  detachDocumentToDeployment,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDetachDocumentToDeployment = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: DetachDocumentToDeploymentParams) => {
    return detachDocumentToDeployment(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
