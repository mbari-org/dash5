import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AccordionHeader, AccordionHeaderProps } from './AccordionHeader'

export default {
  title: 'Navigation/AccordionHeader',
  component: AccordionHeader,
} as Meta

const Template: Story<AccordionHeaderProps> = (args) => (
  <div className="bg-stone-100 p-2" style={{ width: 438 }}>
    <AccordionHeader {...args} />
  </div>
)

const args: AccordionHeaderProps = {
  className: '',
  label: 'Handoff / On call',
  secondaryLabel: 'Tanner P.(you) / Brian K.',
  onToggle: () => {
    console.log('event fired')
  },
  open: true,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=224%3A131',
  },
}

export const WithExpand = Template.bind({})
WithExpand.args = {
  ...args,
  label: 'Comms Queue',
  secondaryLabel: 'surfacing in ~20 min, no items in queue',
  onExpand: () => {
    console.log('event fired')
  },
}
WithExpand.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=224%3A131',
  },
}

export const WithoutSecondary = Template.bind({})
WithoutSecondary.args = { ...args, secondaryLabel: undefined }
WithoutSecondary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=224%3A131',
  },
}

export const Closed = Template.bind({})
Closed.args = { ...args, open: false }
Closed.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=221%3A188',
  },
}
