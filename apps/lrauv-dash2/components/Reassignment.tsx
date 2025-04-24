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
      await assignPicAndOnCall({
        vehicleName: vehicleName.toLowerCase(),
        email: profile.email,
        sign: roleChangeType,
        subRole: isPic ? 'PIC' : 'On-Call',
      })
      queryClient.invalidateQueries(['users', 'picAndOnCall'])
      queryClient.invalidateQueries(['users', 'role'])
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
