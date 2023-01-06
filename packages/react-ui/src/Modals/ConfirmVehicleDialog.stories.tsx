import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  ConfirmVehicleDialog,
  ConfirmVehicleDialogProps,
} from './ConfirmVehicleDialog'

export default {
  title: 'Modals/ConfirmVehicleDialog',
  component: ConfirmVehicleDialog,
} as Meta

const Template: Story<ConfirmVehicleDialogProps> = (args) => (
  <ConfirmVehicleDialog {...args} />
)

const args: ConfirmVehicleDialogProps = {
  vehicle: 'Brizo',
  vehicleList: ['Brizo', 'Tethys', 'GupB'],
  onCancel: () => console.log('cancel'),
  onConfirm: () => console.log('confirm'),
  onSubmit: (vehicle) => console.log(vehicle),
}

export const Command = Template.bind({})
Command.args = { ...args, command: 'configSet' }

Command.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6863%3A989',
  },
}

export const Mission = Template.bind({})
Mission.args = { ...args, mission: 'sci2.xml' }

Mission.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6865%3A1018',
  },
}

export const MissionWithAlternat = Template.bind({})
MissionWithAlternat.args = {
  ...args,
  mission: 'sci2.xml',
  alternateAddress: 'mbari@oreily.org',
}

MissionWithAlternat.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6865%3A1018',
  },
}
