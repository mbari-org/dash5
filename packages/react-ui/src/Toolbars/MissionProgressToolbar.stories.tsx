import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  MissionProgressToolbar,
  MissionProgressToolbarProps,
} from './MissionProgressToolbar'

export default {
  title: 'Toolbars/MissionProgressToolbar',
  component: MissionProgressToolbar,
} as Meta

const Template: Story<MissionProgressToolbarProps> = (args) => (
  <MissionProgressToolbar {...args} />
)

const args: MissionProgressToolbarProps = {
  className: '',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}
