import React, { useState } from 'react'

import { Button } from '../Fields'
import { Overlay, OverlayProps } from './Overlay'
import { Story, Meta } from '@storybook/react/types-6-0'

export default {
  title: 'Overlay/Overlay',
  component: Overlay,
} as Meta

const ExampleContent: React.FC = () => (
  <div className="fixed left-1/2 flex h-64 w-64 items-center overflow-hidden rounded bg-green-600 bg-opacity-75 align-middle">
    <p className="m-auto text-center font-bold text-white">Overlay Content</p>
  </div>
)

const Template: Story<OverlayProps> = (args) => {
  const [enabled, setEnabled] = useState(false)
  const toggleEnabled = () => setEnabled(!enabled)
  return (
    <div className="relative h-40">
      <div
        className="absolute top-0 left-1/2 flex h-40 w-32 items-center overflow-hidden rounded bg-red-800 p-4 text-center align-middle font-bold text-white"
        style={{ transform: 'translate(100px, 200px)' }}
      >
        <p>Absolute Content</p>
        {!enabled ? <ExampleContent /> : null}
        <Overlay>{enabled ? <ExampleContent /> : null}</Overlay>
      </div>
      <Button onClick={toggleEnabled}>
        {enabled ? 'Disable Overlay' : 'Enable Overlay'}
      </Button>
    </div>
  )
}

export const Primary = Template.bind({})
Primary.args = {}
