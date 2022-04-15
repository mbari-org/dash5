import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  NewDeploymentModal,
  NewDeploymentModalProps,
} from './NewDeploymentModal'

export default {
  title: 'Modals/NewDeploymentModal',
  component: NewDeploymentModal,
} as Meta

const Template: Story<NewDeploymentModalProps> = (args) => (
  <NewDeploymentModal {...args} />
)

const args: NewDeploymentModalProps = {
  className: '',
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/gv4hz81GVOY6EFv1ezCjQQ/MBARI-dash-v2?node-id=344%3A7377',
  },
}
