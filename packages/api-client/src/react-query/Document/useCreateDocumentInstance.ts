import { useMutation } from 'react-query'
import {
  CreateDocumentInstanceParams,
  createDocumentInstance,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateDocumentInstance = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: CreateDocumentInstanceParams) => {
    return createDocumentInstance(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
