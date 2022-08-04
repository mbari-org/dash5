import {
  assignPicAndOnCall,
  AssignPicAndOnCallParams,
  RequestConfig,
} from '../../axios'
import { useMutation } from 'react-query'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAssignPicAndOnCall = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: AssignPicAndOnCallParams) => {
    return assignPicAndOnCall(params, {
      ...(config ?? {}),
      instance: axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
