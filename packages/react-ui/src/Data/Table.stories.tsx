import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Table, TableProps } from './Table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export default {
  title: 'Data/Table',
  component: Table,
} as Meta

const Template: Story<TableProps> = (args) => <Table {...args} />

const args: TableProps = {
  rows: [
    {
      values: [
        <div key="1">Lat1/Lon1</div>,
        <div key="2">
          <span className="font-bold">C1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
    {
      values: [
        <div key="3">Lat2/Lon2</div>,
        <div key="4">
          <span className="font-bold">M1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
    {
      values: [
        <div key="5">Lat3/Lon3</div>,
        <div key="6">
          <span className="font-bold">Custom</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
  ],
  header: {
    labels: ['WAYPOINTS', 'VALUES'],
  },
  highlightedStyle: 'text-teal-500',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1407%3A509',
  },
}
export const SingleHeader = Template.bind({})
SingleHeader.args = {
  ...args,
  rows: [
    { values: ['Total mission time:', '6 hours 10 minutes'] },
    { values: ['Time in transit:', '4 hours'] },
    { values: ['Travel distance:', '7.2km'] },
    { values: ['Bottom depth:', '100 to 180 meters'] },
  ],
  header: {
    labels: ['ESTIMATES'],
  },
}
SingleHeader.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1409%3A613',
  },
}
export const ExtraHeader = Template.bind({})
ExtraHeader.args = {
  ...args,
  rows: [
    { values: ['MissionTimeout', '2 hours'] },
    { values: ['MaxDepth', '150 meters'], highlighted: true },
    { values: ['MinAltitude', '20 meters'], highlighted: true },
    { values: ['MinOffshore', '2000 meters'] },
    { values: ['NeedCommsTime', '60 minutes'] },
    { values: ['DiveInterval', '3 hours'] },
  ],
  header: {
    labels: ['SAFETY/COMMS', 'VALUES'],
    accessory: (
      <div className="text-orange-500 opacity-60">
        DVL is off
        <FontAwesomeIcon icon={faInfoCircle as IconProp} className="ml-2" />
      </div>
    ),
  },
}
ExtraHeader.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1409%3A538',
  },
}
export const CellWithIcon = Template.bind({})
CellWithIcon.args = {
  ...args,
  rows: [
    {
      values: [
        <div key="1">
          <FontAwesomeIcon
            icon={faMapMarker as IconProp}
            className="mr-4 text-3xl text-purple-700"
          />
          Lat1/Lon1
        </div>,
        <div key="2">
          <span className="font-bold">C1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
    {
      values: [
        <div key="3">
          <FontAwesomeIcon
            icon={faMapMarker as IconProp}
            className=" mr-4 text-3xl text-purple-700"
          />
          Lat2/Lon2
        </div>,
        <div key="4">
          <span className="font-bold">M1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
    {
      values: [
        <div key="5">
          <FontAwesomeIcon
            icon={faMapMarker as IconProp}
            className=" mr-4 text-3xl text-purple-700"
          />
          Lat3/Lon3
        </div>,
        <div key="6">
          <span className="font-bold">Custom</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
  ],
}
CellWithIcon.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1474%3A625',
  },
}
