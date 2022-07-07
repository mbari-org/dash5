import { useMutation } from 'react-query'
import { updateDeployment, UpdateDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useUpdateDeployment = () => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: UpdateDeploymentParams) => {
      return updateDeployment(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSettled: (data) => {
        console.log('updated deployment:', data)
      },
    }
  )
  return mutation
}
