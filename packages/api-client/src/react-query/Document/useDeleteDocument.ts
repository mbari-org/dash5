import { useMutation } from 'react-query'
import {
  DeleteDocumentParams,
  deleteDocument,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDeleteDocument = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: DeleteDocumentParams) => {
    return deleteDocument(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
