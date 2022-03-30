import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AccordionHeader, AccordionHeaderProps } from './AccordionHeader'

export default {
  title: 'Navigation/AccordionHeader',
  component: AccordionHeader,
} as Meta

const Template: Story<AccordionHeaderProps> = (args) => (
  <AccordionHeader {...args} />
)

const args: AccordionHeaderProps = {
  className: '',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=224%3A131',
  },
}
