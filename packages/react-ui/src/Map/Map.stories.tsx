import { Story, Meta } from '@storybook/react'
import Map, { MapProps } from './Map'

export default {
  title: 'Maps/Map',
} as Meta

const Template: Story<MapProps> = (args) => {
  return (
    <div className="rounded border p-4">
      <Map {...args} className="h-96 w-full" />
    </div>
  )
}

const args: MapProps = {
  center: [37.7749, -122.4194],
  zoom: 10,
  onRequestDepth: async () => {
    return (Math.random() * 10000.0) / 100.0
  },
}

export const Primary = Template.bind({})
Primary.args = args
