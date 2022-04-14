import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AccessoryButton, AccessoryButtonProps } from './AccessoryButton'
import { faEye } from '@fortawesome/pro-light-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export default {
  title: 'Navigation/AccessoryButton',
  component: AccessoryButton,
} as Meta

const Template: Story<AccessoryButtonProps> = (args) => (
  <AccessoryButton {...args} />
)

const args: AccessoryButtonProps = {
  className: '',
  label: 'Shannon J. / Brian K.',
  icon: faEye as IconProp,
  isActive: false,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2%3A126',
  },
}
