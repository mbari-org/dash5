import { useMutation } from 'react-query'
import {
  CreateDocumentParams,
  createDocument,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateDocument = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: CreateDocumentParams) => {
    return createDocument(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
