import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Button, ButtonProps } from './Button'

export default {
  title: 'Navigation/Button',
  component: Button,
} as Meta

const Template: Story<ButtonProps> = (args) => (
  <div className="bg-contentAreaBackgroundAlt flex p-4">
    <Button {...args}>Click Here</Button>
  </div>
)

export const Default = Template.bind({})
Default.args = {}
Default.parameters = {
  jest: 'Button.test.tsx',
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=8%3A182',
  },
}

export const Left = Template.bind({})
Left.args = { align: 'left' }

export const Right = Template.bind({})
Right.args = { align: 'right' }

export const Centered = Template.bind({})
Centered.args = { align: 'center' }

export const Stretch = Template.bind({})
Stretch.args = { align: 'stretch' }

export const Disabled = Template.bind({})
Disabled.args = { disabled: true }
Disabled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=11%3A119',
  },
}

export const Transparent = Template.bind({})
Transparent.args = { appearance: 'transparent' }

export const Destructive = Template.bind({})
Destructive.args = { appearance: 'destructive' }

export const Secondary = Template.bind({})
Secondary.args = { appearance: 'secondary' }
Secondary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=11%3A121',
  },
}

export const Link = Template.bind({})
Link.args = { appearance: 'link' }

export const Custom = Template.bind({})
Custom.args = {
  appearance: 'custom',
  className:
    'border-gray-100 border-2 text-indigo-600 shadow-md px-3 py-1 font-light rounded-full',
}
