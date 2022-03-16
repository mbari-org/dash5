import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ToolTip, ToolTipProps } from './ToolTip'

export default {
  title: 'Navigation/Tool Tip',
  component: ToolTip,
} as Meta

const Template: Story<ToolTipProps> = (args) => (
  <div className="flex bg-stone-100 p-10">
    <div className="relative h-8 w-8 rounded-full bg-stone-400">
      <ToolTip {...args} />
    </div>
  </div>
)

export const Primary = Template.bind({})
Primary.args = { label: 'Tool Tip', active: true }

export const Above = Template.bind({})
Above.args = { label: 'Tool Tip', direction: 'above', active: true }

export const Below = Template.bind({})
Below.args = { label: 'Tool Tip', direction: 'below', active: true }

export const BelowLeft = Template.bind({})
BelowLeft.args = {
  label: 'Tool Tip',
  direction: 'below',
  align: 'left',
  active: true,
}

export const BelowRight = Template.bind({})
BelowRight.args = {
  label: 'Tool Tip',
  direction: 'below',
  align: 'right',
  active: true,
}

export const Left = Template.bind({})
Left.args = { label: 'Tool Tip', direction: 'left', active: true }

export const Right = Template.bind({})
Right.args = { label: 'Tool Tip', direction: 'right', active: true }

export const ShortCut = Template.bind({})
ShortCut.args = { label: 'Paste', shortCut: 'ctrl-v', active: true }
