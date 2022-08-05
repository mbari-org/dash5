import React from 'react'

import { Modal, ModalProps } from './Modal'
import { Button } from '../Navigation'
import { Story, Meta } from '@storybook/react/types-6-0'
import { useState } from '@storybook/client-api'

export default {
  title: 'Modal/Modal',
  component: Modal,
} as Meta

const styles = {
  p: 'text-stone-500 my-8 text-lg rounded bg-stone-100 p-4',
}

const Template: Story<ModalProps> = (args) => {
  const [open, setOpen] = useState(args.open)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)
  return (
    <>
      <Modal {...args} open={open} onClose={handleClose}>
        <p className={styles.p}>
          Are you sure you want to delete your account? All of your data will be
          permenantly lost.
        </p>
        <p className={styles.p}>
          This is just some more content to create a really long body.
        </p>
        <p className={styles.p}>
          All Quill documents must end with a newline character, even if there
          is no formatting applied to the last line. This way, you will always
          have a character position to apply line formatting to.
        </p>
        <p className={styles.p}>
          Many line formats are exclusive. For example Quill does not allow a
          line to simultaneously be both a header and a list, despite being
          possible to represent in the Delta format.
        </p>
        <p className={styles.p}>
          A retain operation simply means keep the next number of characters,
          without modification. If attributes is specified, it still means keep
          those characters, but apply the formatting specified by the attributes
          object. A null value for an attributes key is used to specify format
          removal.
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
Draggable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=137%3A271',
  },
}

export const DisableBodyScroll = Template.bind({})
DisableBodyScroll.args = {
  title: 'Scroll Me!',
  open: true,
  bodyOverflowHidden: true,
}
DisableBodyScroll.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=137%3A271',
  },
}

export const Maximized = Template.bind({})
Maximized.args = {
  title: 'A Bigger Window',
  open: true,
  maximized: true,
}
Maximized.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=137%3A271',
  },
}
