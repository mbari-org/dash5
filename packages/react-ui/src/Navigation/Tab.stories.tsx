import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { Tab, TabProps } from './Tab'
import { faCamera } from '@fortawesome/pro-regular-svg-icons'

export default {
  title: 'Navigation/Tab',
  component: Tab,
} as Meta

const Template: Story<TabProps> = (args) => <Tab {...args} />

const defaultArgs = {
  selected: false,
  icon: faCamera,
  onClick: action('clicked'),
  toolTip: 'Camera',
}

export const Standard = Template.bind({})
Standard.args = defaultArgs

export const Selected = Template.bind({})
Selected.args = { ...defaultArgs, selected: true }
