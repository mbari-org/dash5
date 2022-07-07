import { useMutation } from 'react-query'
import { startDeployment, StartDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useStartDeployment = () => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: StartDeploymentParams) => {
      return startDeployment(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSettled: (data) => {
        console.log('started deployment:', data)
      },
    }
  )
  return mutation
}
