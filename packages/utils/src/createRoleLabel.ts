import { shortenName } from './shortenName'

export interface CreateRoleLabelParams {
  operators: string[]
  role: 'PIC' | 'On-Call'
  currentUser?: string
  authenticated?: boolean
  loading?: boolean
}

/**
 * Creates a human-readable label for role assignments based on a list of operators and the current user's status.
 *
 * @param operators - Array of operator names assigned to the role
 * @param userIsOperator - Boolean indicating if the current user is one of the operators
 * @param role - The type of role, either 'PIC' (Person In Charge) or 'On-Call'
 * @returns A string representing the role status in a user-friendly format
 */
export const createRoleLabel = ({
  operators,
  role,
  currentUser,
  authenticated,
  loading,
}: CreateRoleLabelParams) => {
  if (loading) return '...'
  if (!authenticated && role === 'PIC') return 'Unavailable'
  if (!authenticated && role === 'On-Call') return ''

  const operatorCount = operators.length
  if (!operatorCount) return `No ${role}`

  const userIsOperator = currentUser ? operators.includes(currentUser) : false

  if (userIsOperator) {
    const numOthers = operatorCount - 1
    return numOthers > 0
      ? `You and ${numOthers} other${numOthers === 1 ? '' : 's'}`
      : 'You'
  }
  return operatorCount === 1
    ? shortenName(operators[0])
    : `${operatorCount} ${role}`
}
