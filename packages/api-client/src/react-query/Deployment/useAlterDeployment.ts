import { useMutation, useQueryClient } from 'react-query'
import { alterDeployment, AlterDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useAlterDeployment = () => {
  const queryClient = useQueryClient()
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
