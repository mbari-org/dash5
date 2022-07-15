import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  BatteryMonitorPopup,
  BatteryMonitorPopupProps,
} from './BatteryMonitorPopup'

export default {
  title: 'Popups/BatteryMonitorPopup',
  component: BatteryMonitorPopup,
} as Meta

const Template: Story<BatteryMonitorPopupProps> = (args) => (
  <BatteryMonitorPopup {...args} />
)

const args: BatteryMonitorPopupProps = {
  open: true,
  batteryPercent: 72,
  batteryRemaining: {
    hours: 1,
    miles: 20,
  },
  missionRemaining: {
    hours: 2,
    miles: 40,
  },
  suggestions: [
    {
      headline: 'Reduce thruster speeds to 25% power',
      important: true,
      improvement: '1hr',
      description:
        'Has the biggest impact on battery. This is the top recommendation to conserve battery life.',
      onExternalInfoClick: () => {
        console.log(
          `there's something happening here. what it is ain't exactly clear`
        )
      },
    },
    {
      headline: 'Turn off DVL',
      improvement: '30min',
      description: 'Moderate energy savings',
    },
    {
      headline: 'Turn off cell comms',
      improvement: '20min',
      description: 'Bold move',
    },
  ],
  onClose: () => {
    console.log('close')
  },
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5874%3A680',
  },
}
