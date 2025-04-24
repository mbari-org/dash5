import {
  useVehiclePicAndOnCall,
  useAssignPicAndOnCall,
} from '@mbari/api-client'
import {
  ReassignmentModal,
  ReassignmentTableProps,
  RoleChangeType,
} from '@mbari/react-ui'

import useGlobalModalId from '../lib/useGlobalModalId'
import { capitalize } from '@mbari/utils'
import { useQueryClient } from 'react-query'
import { useTethysApiContext } from '@mbari/api-client'
import toast from 'react-hot-toast'

const Reassignment: React.FC<{ vehicleNames: string[] }> = ({
  vehicleNames,
}) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useVehiclePicAndOnCall({
    vehicleName: vehicleNames,
  })
  const { setGlobalModalId } = useGlobalModalId()
  const { profile } = useTethysApiContext()
  const currentUserName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : ''

  const handleClose = () => setGlobalModalId(null)

  const { mutate: assignPicAndOnCall, isLoading: loadingAssignPicAndOnCall } =
    useAssignPicAndOnCall()

  const handleRoleChange = async (
    vehicleName: string,
    roleChangeType: RoleChangeType,
    isPic: boolean
  ) => {
    if (profile?.email) {
      assignPicAndOnCall(
        {
          vehicleName: vehicleName.toLowerCase(),
          email: profile.email,
          sign: roleChangeType,
          subRole: isPic ? 'PIC' : 'On-Call',
        },
        {
          onSuccess: () => {
            toast.success(
              `Successfully ${
                roleChangeType === 'in' ? 'signed in' : 'signed off'
              } as ${isPic ? 'PIC' : 'On-Call'} for ${vehicleName}`
            )

            queryClient.invalidateQueries(['users', 'picAndOnCall'])
            queryClient.invalidateQueries(['users', 'role'])
          },
          onError: () => {
            toast.error(
              `Failed to ${
                roleChangeType === 'in' ? 'sign in' : 'sign off'
              } as ${isPic ? 'PIC' : 'On-Call'} for ${vehicleName}`
            )
          },
        }
      )
    }
  }

  const vehicleData: ReassignmentTableProps['vehicles'] =
    data?.map((v) => ({
      name: capitalize(v.vehicleName),
      picOperators: v.pics.map((pic) => pic.user),
      onCallOperators: v.onCalls.map((onCall) => onCall.user),
    })) || []

  return (
    <ReassignmentModal
      onClose={handleClose}
      vehicles={vehicleData}
      currentUserName={currentUserName}
      onRoleChange={handleRoleChange}
      isLoading={isLoading || loadingAssignPicAndOnCall}
      open
    />
  )
}

ReassignmentModal.displayName = 'Dash2.Components.Reassignment'

export default Reassignment
