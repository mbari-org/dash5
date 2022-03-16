import React from 'react'

import { Button } from '../Navigation'
import { Dialog, DialogProps } from './Dialog'
import { Story, Meta } from '@storybook/react/types-6-0'
import { useState } from '@storybook/client-api'

export default {
  title: 'Modal/Dialog',
  component: Dialog,
} as Meta

const Template: Story<DialogProps> = (args) => {
  const [open, setOpen] = useState(args.open)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)
  return (
    <>
      <Dialog
        {...args}
        open={open}
        onClose={handleClose}
        onCancel={args.onCancel}
      />
      <Button onClick={handleOpen} disabled={open}>
        Open Window
      </Button>
    </>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  title: 'Delete Order?',
  message:
    'Are you sure you want to delete this order? You cannot undo this action.',
  open: true,
  onConfirm: () => {},
  onCancel: () => {},
}

export const CustomLabels = Template.bind({})
CustomLabels.args = {
  ...Primary.args,
  confirmLabel: 'Yes, Please!',
  cancelLabel: 'On second thought...',
  onConfirm: () => {},
  onCancel: () => {},
}

export const ConfirmOnly = Template.bind({})
ConfirmOnly.args = {
  title: 'Documents Not Available',
  message: 'Sorry - you do not have access to the documents.',
  open: true,
  confirmLabel: 'OK',
  onConfirm: () => {},
}
