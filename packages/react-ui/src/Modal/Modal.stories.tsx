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
        <form>
          <Fields grow>
            <TextField
              label="Customer Name"
              name="name"
              className="flex-grow"
              icon={faOrnament}
            />
            <Button type="submit">Create Order</Button>
          </Fields>
        </form>
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
}

export const Draggable = Template.bind({})
Draggable.args = {
  title: 'Drag Me!',
  open: true,
  draggable: true,
}
