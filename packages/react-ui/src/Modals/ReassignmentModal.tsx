import React from 'react'
import {
  ReassignmentForm,
  ReassignmentFormProps,
  ReassignmentFormValues,
} from '../Forms/ReassignmentForm'
import { Modal, ModalPropsWithoutTitle } from '../Modal'
import { AsyncSubmitHandler } from '@sumocreations/forms'

export interface ReassignmentModalProps
  extends ModalPropsWithoutTitle,
    ReassignmentFormProps {
  onSubmit: AsyncSubmitHandler<ReassignmentFormValues>
}

export const ReassignmentModal: React.FC<ReassignmentModalProps> = ({
  vehicles,
  pics,
  onCalls,
  disableOnCalls,
  disablePics,
  loading,
  onSubmit,
  ...modalProps
}) => (
  <Modal
    {...modalProps}
    title="On watch/on call"
    form="reassignmentForm"
    cancelButtonText="Cancel"
    confirmButtonText="Save"
  >
    <ReassignmentForm
      onSubmit={onSubmit}
      id="reassignmentForm"
      vehicles={vehicles}
      pics={pics}
      onCalls={onCalls}
      disableOnCalls={disableOnCalls}
      disablePics={disablePics}
      loading={loading}
      hideSubmit
    />
  </Modal>
)

ReassignmentModal.displayName = 'Modals.ReassignmentModal'
