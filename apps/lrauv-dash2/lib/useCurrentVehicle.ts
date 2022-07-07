import { useRouter } from 'next/router'

const useCurrentVehicle = () => {
  const router = useRouter()
  return router.query.deployment?.[0]
}
export default useCurrentVehicle
