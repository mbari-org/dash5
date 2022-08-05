import { useMutation } from 'react-query'
import {
  AttachDocumentToVehicleParams,
  attachDocumentToVehicle,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAttachDocumentToVehicle = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: AttachDocumentToVehicleParams) => {
    return attachDocumentToVehicle(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
