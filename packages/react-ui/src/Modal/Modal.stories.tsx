import React from 'react'

import { Modal, ModalProps } from './Modal'
import { Button } from '../Navigation'
import { Fields, TextField } from '../Fields'
import { Story, Meta } from '@storybook/react/types-6-0'
import { faOrnament } from '@fortawesome/pro-regular-svg-icons'
import { useState } from '@storybook/client-api'

export default {
  title: 'Modal/Modal',
  component: Modal,
} as Meta

const Template: Story<ModalProps> = (args) => {
  const [open, setOpen] = useState(args.open)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)
  return (
    <>
      <Modal {...args} open={open} onClose={handleClose}>
        <p className="text-sm text-stone-500">
          Are you sure you want to delete your account? All of your data will be
          permenantly lost.
        </p>
      </Modal>
      <Button onClick={handleOpen} disabled={open}>
        Open Window
      </Button>
    </>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  title: 'Create Order',
  open: true,
  disableCancel: true,
}
Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=137%3A271',
  },
}

export const Draggable = Template.bind({})
Draggable.args = {
  title: 'Drag Me!',
  open: true,
  draggable: true,
}
Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=137%3A271',
  },
}
