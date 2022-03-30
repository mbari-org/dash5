import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { NewDeployment, NewDeploymentProps } from './NewDeployment'

export default {
  title: 'Modals/NewDeployment',
  component: NewDeployment,
} as Meta

const Template: Story<NewDeploymentProps> = (args) => (
  <NewDeployment {...args} />
)

const args: NewDeploymentProps = {
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
