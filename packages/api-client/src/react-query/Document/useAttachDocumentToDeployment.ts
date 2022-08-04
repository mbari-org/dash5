import { useMutation } from 'react-query'
import {
  AttachDocumentToDeploymentParams,
  attachDocumentToDeployment,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAttachDocumentToDeployment = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: AttachDocumentToDeploymentParams) => {
    return attachDocumentToDeployment(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
