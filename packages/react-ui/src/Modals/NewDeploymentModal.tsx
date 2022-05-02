import React from 'react'
import {
  NewDeploymentForm,
  NewDeploymentFormValues,
} from '../Forms/NewDeploymentForm'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { Modal, ModalProps } from '../Modal/Modal'
import { SelectOption } from '../Fields/Select'

type ModalPropsWithOutTitle = Omit<ModalProps, 'title'>
export interface NewDeploymentModalProps extends ModalPropsWithOutTitle {
  vehicleName: string
  onSubmit: AsyncSubmitHandler<NewDeploymentFormValues>
  tags: SelectOption[]
}

export const NewDeploymentModal: React.FC<NewDeploymentModalProps> = ({
  vehicleName,
  onSubmit,
  tags,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      title={`New ${vehicleName} deployment`}
      form="newDeploymentForm"
      confirmButtonText="Submit"
    >
      <NewDeploymentForm
        onSubmit={onSubmit}
        id="newDeploymentForm"
        tags={tags}
        hideSubmit
      />
    </Modal>
  )
}

NewDeploymentModal.displayName = 'Modals.NewDeploymentModal'
