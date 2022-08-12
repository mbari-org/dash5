import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AbsoluteOverlay, AbsoluteOverlayProps } from './AbsoluteOverlay'

export default {
  title: 'Indicators/AbsoluteOverlay',
  component: AbsoluteOverlay,
} as Meta

const Template: Story<AbsoluteOverlayProps> = (args) => (
  <div className="relative h-96 w-full border border-stone-400 bg-stone-200">
    <AbsoluteOverlay {...args} />
    <p className="p-4 text-xl">
      This is some text content beneath the overlay.
    </p>
  </div>
)

const args: AbsoluteOverlayProps = {}

export const Standard = Template.bind({})
Standard.args = args
