import { Dialog, ModalProps } from '@mbari/react-ui'
import { useQueryClient } from 'react-query'
import {
  useDetachDocumentToVehicle,
  useDetachDocumentToDeployment,
} from '@mbari/api-client'
import useGlobalModalId from '../lib/useGlobalModalId'
import toast from 'react-hot-toast'

export type DetachmentModalProps = Omit<ModalProps, 'title' | 'open'>

const DetachmentModal: React.FC<DetachmentModalProps> = (props) => {
  const queryClient = useQueryClient()
  const { setGlobalModalId, globalModalId } = useGlobalModalId()
  const documentName = globalModalId?.meta?.documentName
  const docId = globalModalId?.meta?.docId
  const vehicleName = globalModalId?.meta?.vehicleName
  const deploymentId = globalModalId?.meta?.deploymentId
  const deploymentName = globalModalId?.meta?.deploymentName
  const attachmentType = globalModalId?.meta?.attachmentType
  const handleDismiss = () => setGlobalModalId(null)

  const { mutateAsync: detachVehicle, isLoading: detachingFromVehicle } =
    useDetachDocumentToVehicle()
  const { mutateAsync: detachDeployment, isLoading: detachingFromDeployment } =
    useDetachDocumentToDeployment()
  const loading = detachingFromDeployment || detachingFromVehicle

  const handleDetachment = async () => {
    const promises = []
    if (attachmentType === 'vehicle') {
      promises.push(detachVehicle({ docId, vehicleName }))
    }
    if (attachmentType === 'deployment') {
      promises.push(detachDeployment({ docId, deploymentId }))
    }
    await Promise.all(promises)
    queryClient.invalidateQueries('document')
    handleDismiss()
    toast.success(`Detached "${documentName}" from ${attachmentType}`)
  }

  return (
    <Dialog
      {...props}
      title={`Detach "${documentName}" from ${attachmentType}.`}
      message={`Are you sure you want to detach this document from the ${attachmentType}: '${
        vehicleName ?? deploymentName
      }'?`}
      onConfirm={handleDetachment}
      onCancel={handleDismiss}
      onClose={handleDismiss}
      loading={loading}
      open
    />
  )
}

DetachmentModal.displayName = 'Dash2.Component.DetachmentModal'

export default DetachmentModal
