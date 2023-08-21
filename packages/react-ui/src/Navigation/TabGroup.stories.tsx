import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Tab } from './Tab'
import { TabGroup } from './TabGroup'

export default {
  title: 'Navigation/Tab Group',
  component: TabGroup,
} as Meta

const Template: Story<{ grow: boolean }> = ({ grow }) => {
  const [selected, setSelected] = useState(
    'camera' as 'camera' | 'video' | 'audio'
  )
  return (
    <TabGroup>
      <Tab
        label="Vehicle State"
        selected={selected === 'camera'}
        onClick={() => setSelected('camera')}
      />
      <Tab
        label="Depth Data"
        selected={selected === 'video'}
        onClick={() => setSelected('video')}
      />
    </TabGroup>
  )
}

const args = {}

export const Standard: any = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1601%3A524',
  },
}

export const Grow: any = Template.bind({}, { grow: true })
Grow.args = args
