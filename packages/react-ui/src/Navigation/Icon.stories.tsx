import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Icon, IconDefinitions } from './Icon'
import { faCalendarAlt } from '@fortawesome/pro-regular-svg-icons'

export default {
  title: 'Navigation/Icon',
  component: Icon,
} as Meta

const Template: Story<IconDefinitions> = (args) => (
  <div className="flex bg-stone-100 p-10">
    <Icon {...args} />
  </div>
)

export const Primary = Template.bind({})
Primary.args = { mode: 'primary', icon: faCalendarAlt }

export const Secondary = Template.bind({})
Secondary.args = { mode: 'secondary', icon: faCalendarAlt }

const DarkTemplate: Story<IconDefinitions> = (args) => (
  <div className="flex bg-indigo-600 p-10">
    <Icon {...args} />
  </div>
)

export const Negative = DarkTemplate.bind({})
Negative.args = { mode: 'negative', icon: faCalendarAlt }
