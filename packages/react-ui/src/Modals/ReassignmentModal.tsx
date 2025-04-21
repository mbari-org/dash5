import React from 'react'
import { Modal, ModalPropsWithoutTitle } from '../Modal'

import {
  ReassignmentTableProps,
  ReassignmentTable,
} from '../Tables/ReassignmentTable'

export type RoleChangeType = 'in' | 'off'

export interface ReassignmentModalProps
  extends ModalPropsWithoutTitle,
    ReassignmentTableProps {}

export const ReassignmentModal: React.FC<ReassignmentModalProps> = ({
  vehicles,
  currentUserName,
  isLoading,
  onRoleChange,
  onClose,
  ...modalProps
}) => (
  <Modal
    {...modalProps}
    title="On watch/on call"
    form="reassignmentForm"
    cancelButtonText="Cancel"
    confirmButtonText="Done"
    onClose={onClose}
    onConfirm={onClose}
  >
    <ReassignmentTable
      vehicles={vehicles}
      currentUserName={currentUserName}
      onRoleChange={onRoleChange}
      isLoading={isLoading}
    />
  </Modal>
)

ReassignmentModal.displayName = 'Modals.ReassignmentModal'
