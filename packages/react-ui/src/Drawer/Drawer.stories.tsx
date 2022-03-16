import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import {
  faUpload,
  faFileInvoice,
  faUsers,
  faSignOut,
} from '@fortawesome/pro-regular-svg-icons'
import { withDesign } from 'storybook-addon-designs'

import { Drawer } from './Drawer'
import { DrawerItem } from './DrawerItem'

export default {
  title: 'Drawer/Drawer',
  component: Drawer,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  decorators: [withDesign],
} as ComponentMeta<typeof Drawer>

const Template: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(args.open)
  const handleDismiss = () => setOpen(false)

  return (
    <Drawer {...args} onDismiss={handleDismiss} open={open}>
      <DrawerItem icon={faUpload} name="Import Data" />
      <DrawerItem icon={faFileInvoice} name="Orders" />
      <DrawerItem icon={faUsers} name="Users" />
      <div className="mt-auto" />
      <DrawerItem icon={faSignOut} name="Logout" />
    </Drawer>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  open: true,
  title: 'Menu',
}

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/csIZsgYkRZwRcHlzytg6Zh/Order-Portal?node-id=2%3A55',
  },
}

export const Closed = Template.bind({})
Closed.args = {}
