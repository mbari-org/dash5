import {
  useVehiclePicAndOnCall,
  useAssignPicAndOnCall,
  useUsersByRole,
} from '@mbari/api-client'
import { ReassignmentModal, ReassignmentModalProps } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import { capitalize } from '@mbari/utils'
import { useQueryClient } from 'react-query'

const Reassignment: React.FC<{ vehicleNames: string[] }> = ({
  vehicleNames,
}) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useVehiclePicAndOnCall({
    vehicleName: vehicleNames,
  })
  const { data: operators, isLoading: loadingOperators } = useUsersByRole({
    role: 'operator',
  })
  const { setGlobalModalId } = useGlobalModalId()
  const handleClose = () => setGlobalModalId(null)

  const { mutate: assignPicAndOnCall, isLoading: loadingAssignPicAndOnCall } =
    useAssignPicAndOnCall()
  const handleReassignmentSubmit: ReassignmentModalProps['onSubmit'] = async ({
    vehicleNames: selectedVehicles,
    pic,
    onCall,
  }) => {
    await Promise.all(
      selectedVehicles.map(async (vehicleName: string) => {
        await assignPicAndOnCall({
          vehicleName,
          sign: 'in',
          subRole: 'PIC',
          email: pic,
        })
        await assignPicAndOnCall({
          vehicleName,
          sign: 'in',
          subRole: 'On-Call',
          email: onCall,
        })
      })
    )
    queryClient.invalidateQueries(['users', 'picAndOnCall'])
    queryClient.invalidateQueries(['users', 'role'])
    handleClose()
    return undefined
  }

  return (
    <ReassignmentModal
      onClose={handleClose}
      vehicles={data?.map((v) => ({
        vehicleName: capitalize(v.vehicleName),
        vehicleId: v.vehicleName,
        pic: v.pics[0]?.user ?? 'Not Assigned',
        onCall: v.onCalls[0]?.user ?? 'Not Assigned',
      }))}
      onSubmit={handleReassignmentSubmit}
      pics={operators?.map((u) => ({
        name: u.fullName,
        id: u.email,
      }))}
      onCalls={operators?.map((u) => ({
        name: u.fullName,
        id: u.email,
      }))}
      loading={isLoading || loadingOperators || loadingAssignPicAndOnCall}
      open
    />
  )
}

ReassignmentModal.displayName = 'Dash2.Components.Reassignment'

export default Reassignment
