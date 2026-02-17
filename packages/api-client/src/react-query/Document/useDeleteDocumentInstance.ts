import { useMutation } from 'react-query'
import {
  DeleteDocumentInstanceParams,
  deleteDocumentInstance,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDeleteDocumentInstance = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: DeleteDocumentInstanceParams) => {
    return deleteDocumentInstance(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
