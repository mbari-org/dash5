import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ConfirmStopModal, ConfirmStopModalProps } from './ConfirmStopModal'

export default {
  title: 'Modals/ConfirmStopModal',
  component: ConfirmStopModal,
} as Meta

const Template: Story<ConfirmStopModalProps> = (args) => (
  <ConfirmStopModal {...args} />
)

const args: ConfirmStopModalProps = {
  open: true,
  onClose: () => {},
  onCancel: () => {},
  onConfirmValue: () => {},
  vehicleName: 'Brizo',
  vehicleUrl: '/vehicles/brizo',
  title: '',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A612',
  },
}
