import { useMutation, useQueryClient } from 'react-query'
import { addExtraEmailToUser, AddExtraEmailToUserParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAddExtraEmail = () => {
  const queryClient = useQueryClient()
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: AddExtraEmailToUserParams) => {
      return addExtraEmailToUser(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['email', 'addresses'])
      },
    }
  )
  return mutation
}
