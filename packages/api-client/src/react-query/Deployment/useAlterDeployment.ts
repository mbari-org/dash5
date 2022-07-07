import { useMutation } from 'react-query'
import { alterDeployment, AlterDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAlterDeployment = () => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: AlterDeploymentParams) => {
      return alterDeployment(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSettled: (data) => {
        console.log('altered deployment:', data)
      },
    }
  )
  return mutation
}
