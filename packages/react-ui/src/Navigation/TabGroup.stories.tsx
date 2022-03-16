import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Tab } from './Tab'
import { TabGroup } from './TabGroup'

import {
  faCamera,
  faVideo,
  faSpeaker,
} from '@fortawesome/pro-regular-svg-icons'

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
        icon={faCamera}
        selected={selected === 'camera'}
        onClick={() => setSelected('camera')}
        grow={grow}
      />
      <Tab
        icon={faVideo}
        selected={selected === 'video'}
        onClick={() => setSelected('video')}
        grow={grow}
      />
      <Tab
        icon={faSpeaker}
        selected={selected === 'audio'}
        onClick={() => setSelected('audio')}
        grow={grow}
      />
    </TabGroup>
  )
}

const args = {}

export const Standard: any = Template.bind({})
Standard.args = args

export const Grow: any = Template.bind({}, { grow: true })
Grow.args = args
