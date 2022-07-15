import { useMutation, useQueryClient } from 'react-query'
import { updateDeployment, UpdateDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useUpdateDeployment = () => {
  const queryClient = useQueryClient()
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
        queryClient.invalidateQueries([
          'deployment',
          'deployments',
          data?.vehicle,
        ])
      },
    }
  )
  return mutation
}
