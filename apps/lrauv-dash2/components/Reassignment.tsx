import {
  usePicAndOnCall,
  useAssignPicAndOnCall,
  useUsersByRole,
} from '@mbari/api-client'
import { ReassignmentModal, ReassignmentFormProps } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import { capitalize } from '@mbari/utils'

const Reassignment: React.FC<{ vehicleNames: string[] }> = ({
  vehicleNames,
}) => {
  const { data, isLoading } = usePicAndOnCall({
    vehicleName: vehicleNames,
  })
  const { data: operators, isLoading: loadingOperators } = useUsersByRole({
    role: 'operator',
  })
  const { setGlobalModalId } = useGlobalModalId()
  const handleClose = () => setGlobalModalId(null)

  const { mutate: assignPicAndOnCall, isLoading: loadingAssignPicAndOnCall } =
    useAssignPicAndOnCall()
  const handleReassignmentSubmit: ReassignmentFormProps['onSubmit'] = async ({
    vehicleName: selectedVehicles,
    pic,
    onCall,
  }) => {
    await Promise.all(
      selectedVehicles.map(async (vehicleName) => {
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
    handleClose()
  }

  return (
    <ReassignmentModal
      onClose={handleClose}
      vehicles={data?.map((v) => ({
        vehicleName: capitalize(v.vehicleName),
        vehicleId: v.vehicleName,
        pic: v.pic?.user ?? 'Not Assigned',
        onCall: v.onCall?.user ?? 'Not Assigned',
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
