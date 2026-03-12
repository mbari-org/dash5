import { Story, Meta } from '@storybook/react'
import Map, { MapProps, MapDepthDisplay } from './Map'
import { useCallback, useState } from 'react'

export default {
  title: 'Maps/Map',
} as Meta

const mockDepthRequest = async (_lat: number, _lng: number) => ({
  depth: (Math.random() * 10000.0) / 100.0,
  status: 'success',
})

const Template: Story<MapProps> = (args) => {
  const [center, setCenter] = useState(args.center)
  const onRequestCoordinate = useCallback(() => {
    setCenter([37.7749 + Math.random() * 4, -122.4194 + Math.random() * 4])
  }, [setCenter])

  return (
    <div className="rounded border p-4">
      <Map
        {...args}
        className="h-96 w-full"
        onRequestCoordinate={onRequestCoordinate}
        center={center}
      >
        <MapDepthDisplay depthRequest={mockDepthRequest} />
      </Map>
    </div>
  )
}

const args: MapProps = {
  center: [37.7749, -122.4194],
  zoom: 10,
}

export const Primary = Template.bind({})
Primary.args = args
