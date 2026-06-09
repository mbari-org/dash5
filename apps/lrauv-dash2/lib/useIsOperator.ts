import { useMbariAuth } from './useMbariAuth'

/**
 * Returns true when the signed-in user holds the "operator" role assigned
 * in the MBARI Entra ID app registration. Operators can send commands;
 * all other authenticated users are read-only viewers.
 */
const useIsOperator = (): boolean => {
  const { roles } = useMbariAuth()
  return roles.includes('operator')
}

export default useIsOperator
