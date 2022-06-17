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
  console.log(args)
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
  title: 'Abort Mission?',
  message:
    "Are you sure you want to abort your mission? There's no turning back now Jim.",
  open: true,
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
}

export const CustomLabels = Template.bind({})
CustomLabels.args = {
  ...Primary.args,
  confirmButtonText: 'Yes, Please!',
  cancelButtonText: 'On second thought...',
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
}

export const ConfirmOnly = Template.bind({})
ConfirmOnly.args = {
  title: 'Documents Not Available',
  message: 'Sorry - you do not have access to the documents.',
  open: true,
  confirmButtonText: 'OK',
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: null,
}

export const NoFooter = Template.bind({})
NoFooter.args = {
  ...Primary.args,
  onCancel: null,
  onConfirm: null,
}
