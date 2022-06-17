import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Footer, FooterProps } from './Footer'

export default {
  title: 'Modal/Footer',
  component: Footer,
} as Meta

const Template: Story<FooterProps> = (args) => <Footer {...args} />

const args: FooterProps = {
  className: '',
}

export const Standard = Template.bind({})
Standard.args = {
  ...args,
  onConfirm: () => {
    console.log('event fired')
  },
}
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=9%3A117',
  },
}

export const WithCancel = Template.bind({})
WithCancel.args = {
  ...args,
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
}
WithCancel.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=10%3A121',
  },
}

export const WithCancelDisabled = Template.bind({})
WithCancelDisabled.args = {
  ...args,
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
  disableCancel: true,
}
WithCancelDisabled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=10%3A122',
  },
}

export const WithCconfirmDisabled = Template.bind({})
WithCconfirmDisabled.args = {
  ...args,
  onConfirm: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
  disableConfirm: true,
}
WithCconfirmDisabled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=10%3A122',
  },
}
