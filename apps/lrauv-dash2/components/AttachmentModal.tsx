import { useState } from 'react'
import { Modal, ModalProps } from '@mbari/react-ui'
import { useQueryClient } from 'react-query'
import {
  useAttachDocumentToVehicle,
  useAttachDocumentToDeployment,
} from '@mbari/api-client'
import useGlobalModalId from '../lib/useGlobalModalId'

export type AttachmentModalProps = Omit<ModalProps, 'title' | 'open'>

const AttachmentModal: React.FC<AttachmentModalProps> = (props) => {
  const [attachTo, setAttachTo] = useState('')
  const queryClient = useQueryClient()
  const { setGlobalModalId, globalModalId } = useGlobalModalId()
  const documentName = globalModalId?.meta?.documentName
  const docId = globalModalId?.meta?.docId
  const vehicleName = globalModalId?.meta?.vehicleName
  const deploymentId = globalModalId?.meta?.deploymentId
  const handleDismiss = () => setGlobalModalId(null)

  const { mutateAsync: attachVehicle } = useAttachDocumentToVehicle()
  const { mutateAsync: attachDeployment } = useAttachDocumentToDeployment()

  const handleAttachment = async () => {
    const promises = []
    if (
      (attachTo === 'vehicle' || attachTo === 'both') &&
      docId &&
      vehicleName
    ) {
      promises.push(attachVehicle({ docId, vehicleName }))
    }
    if (
      (attachTo === 'deployment' || attachTo === 'both') &&
      deploymentId &&
      docId
    ) {
      promises.push(attachDeployment({ docId, deploymentId }))
    }
    await Promise.all(promises)
    queryClient.invalidateQueries('document')
    handleDismiss()
  }

  return (
    <Modal
      {...props}
      title={`Attach "${documentName}" to...`}
      onCancel={handleDismiss}
      onConfirm={handleAttachment}
      open
    >
      <ul>
        <li>
          <input
            type="radio"
            name="attachTo"
            value="vehicle"
            onChange={() => setAttachTo('vehicle')}
            checked={attachTo === 'vehicle'}
          />{' '}
          Current Vehicle
        </li>
        <li>
          <input
            type="radio"
            name="attachTo"
            value="deployment"
            onChange={() => setAttachTo('deployment')}
            checked={attachTo === 'deployment'}
          />{' '}
          Current Deployment
        </li>
        <li>
          <input
            type="radio"
            name="attachTo"
            value="both"
            onChange={() => setAttachTo('both')}
            checked={attachTo === 'both'}
          />{' '}
          Both
        </li>
      </ul>
    </Modal>
  )
}

AttachmentModal.displayName = 'Dash2.Component.AttachmentModal'

export default AttachmentModal
