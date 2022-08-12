import { useLastDeployment, useDeployments } from '@mbari/api-client'
import { useRouter } from 'next/router'
import useCurrentVehicle from './useCurrentVehicle'

const useCurrentDeployment = () => {
  const router = useRouter()
  const vehicle = useCurrentVehicle()

  const deploymentId = parseInt(router.query.deployment?.[1] ?? '0', 10)

  const { data: lastDeployment, isLoading } = useLastDeployment(
    {
      vehicle: vehicle as string,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000, enabled: !!vehicle && !deploymentId }
  )

  const { data: deploymentData, isLoading: deploymentsLoading } =
    useDeployments(
      {
        vehicle: vehicle as string,
        deploymentId,
      },
      { staleTime: 5 * 60 * 1000, enabled: !!vehicle && !!deploymentId }
    )

  const deployment = deploymentData?.[0] ?? lastDeployment

  return { vehicle, deployment, isLoading: isLoading || deploymentsLoading }
}

export default useCurrentDeployment
