import { useMutation } from 'react-query'
import {
  DetachDocumentToVehicleParams,
  detachDocumentToVehicle,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDetachDocumentToVehicle = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: DetachDocumentToVehicleParams) => {
    return detachDocumentToVehicle(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
