import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { BarItem, BarItemProps } from './BarItem'
import { faPencil } from '@fortawesome/pro-regular-svg-icons'
import { Avatar } from './Avatar'

export default {
  title: 'Navigation/Bar Item',
  component: BarItem,
} as Meta

const Template: Story<BarItemProps> = (args) => <BarItem {...args} />

const args = {
  icon: faPencil,
  onClick: action('clicked'),
  toolTip: 'edit',
}

export const Standard = Template.bind({})
Standard.args = args

export const Indicated = Template.bind({})
Indicated.args = { ...args, indicated: true }

export const IndicatedPrimary = Template.bind({})
IndicatedPrimary.args = {
  ...args,
  mode: 'negative',
  indicatorMode: 'primary',
  indicated: true,
}

export const IndicatedSecondary = Template.bind({})
IndicatedSecondary.args = {
  ...args,
  mode: 'negative',
  indicatorMode: 'secondary',
  indicated: true,
}

export const Disabled = Template.bind({})
Disabled.args = {
  ...args,
  disabled: true,
}

export const LeftToolTip = Template.bind({})
LeftToolTip.args = { ...args, toolTipDirection: 'left' }

export const WithShortCut = Template.bind({})
WithShortCut.args = { ...args, shortCut: 'e' }

export const WithOutToolTip = Template.bind({})
WithOutToolTip.args = { ...args, toolTip: undefined }

const TemplateWithAvatar: Story<BarItemProps> = (args) => (
  <BarItem {...args}>
    <Avatar name={args.toolTip ?? ''} color="#5c0" />
  </BarItem>
)

export const WithCustomView = TemplateWithAvatar.bind({})
WithCustomView.args = {
  ...args,
  icon: undefined,
  indicated: true,
  indicatorMode: 'secondary',
  toolTip: 'Revolution Entertainment',
  toolTipDirection: 'right',
}
