import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Table, TableProps } from './Table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faMapMarkerAlt } from '@fortawesome/pro-light-svg-icons'

export default {
  title: 'Data/Table',
  component: Table,
} as Meta

const Template: Story<TableProps> = (args) => <Table {...args} />
const ScrollTemplate: Story<TableProps> = (args) => (
  <div className="h-60">
    <Table {...args} />
  </div>
)

const args: TableProps = {
  rows: [
    {
      cells: [
        { label: <div key="1">Lat1/Lon1</div> },
        {
          label: (
            <div key="2">
              <span className="font-bold">C1</span> 36.797, -121.847
            </div>
          ),
        },
      ],
      highlighted: true,
    },
    {
      cells: [
        { label: <div key="3">Lat2/Lon2</div> },
        {
          label: (
            <div key="4">
              <span className="font-bold">M1</span> 36.797, -121.847
            </div>
          ),
        },
      ],
      highlighted: true,
    },
    {
      cells: [
        { label: <div key="5">Lat3/Lon3</div> },
        {
          label: (
            <div key="6">
              <span className="font-bold">Custom</span> 36.797, -121.847
            </div>
          ),
        },
      ],
      highlighted: true,
    },
  ],
  header: {
    cells: [
      {
        label: 'WAYPOINTS',
      },
      { label: 'VALUES' },
    ],
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
    {
      cells: [
        { label: 'Total mission time:' },
        { label: '6 hours 10 minutes' },
      ],
    },
    { cells: [{ label: 'Time in transit:' }, { label: '4 hours' }] },
    { cells: [{ label: 'Travel distance:' }, { label: '7.2km' }] },
    { cells: [{ label: 'Bottom depth:' }, { label: '100 to 180 meters' }] },
  ],
  header: {
    cells: [{ label: 'ESTIMATES' }],
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
    { cells: [{ label: 'MissionTimeout' }, { label: '2 hours' }] },
    {
      cells: [{ label: 'MaxDepth' }, { label: '150 meters' }],
      highlighted: true,
    },
    {
      cells: [{ label: 'MinAltitude' }, { label: '20 meters' }],
      highlighted: true,
    },
    { cells: [{ label: 'MinOffshore' }, { label: '2000 meters' }] },
    { cells: [{ label: 'NeedCommsTime' }, { label: '60 minutes' }] },
    { cells: [{ label: 'DiveInterval' }, { label: '3 hours' }] },
  ],
  header: {
    cells: [
      {
        label: 'SAFETY/COMMS',
      },
      { label: 'VALUES' },
    ],
    accessory: (
      <span className="text-orange-500 opacity-60">
        DVL is off
        <FontAwesomeIcon icon={faInfoCircle as IconProp} className="ml-2" />
      </span>
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
      cells: [
        {
          label: 'Lat1/Lon1',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-4 text-3xl text-purple-700"
            />
          ),
        },
        {
          label: (
            <div key="2">
              <span className="font-bold">C1</span> 36.797, -121.847
            </div>
          ),
        },
      ],
      highlighted: true,
    },
    {
      cells: [
        {
          label: 'Lat2/Lon2',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-4 text-3xl text-purple-700"
            />
          ),
        },
        {
          label: (
            <div key="4">
              <span className="font-bold">M1</span> 36.797, -121.847
            </div>
          ),
        },
      ],
      highlighted: true,
    },
    {
      cells: [
        {
          label: 'Lat3/Lon3',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-4 text-3xl text-purple-700"
            />
          ),
        },
        {
          label: (
            <div key="6">
              <span className="font-bold">Custom</span> 36.797, -121.847
            </div>
          ),
        },
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

export const Sortable = Template.bind({})
Sortable.args = {
  ...args,
  scrollable: true,
  onSelectRow: (index) => {
    console.log(index)
  },
  header: {
    cells: [
      {
        label: 'MISSION NAME',
        sortDirection: 'desc',
        onSort: (column) => {
          console.log(column)
        },
      },
      {
        label: 'ALL LRAUV',
        onSort: (column) => {
          console.log(column)
        },
      },
      {
        label: 'DESCRIPTION',
      },
    ],
  },
  rows: [
    {
      cells: [
        { label: 'Science: sci2', secondary: 'Test mission' },
        { label: 'Brizo' },
        {
          label:
            "Vehicle yo-yo's to the specified waypoints, with science turned on.",
          secondary: 'Run by Jordan Caress on Dec 10, 2021 with 2 waypoints',
        },
      ],
    },
    {
      cells: [
        { label: 'Science: sci2', secondary: 'Test sci mission' },
        { label: 'Tethys' },
        {
          label:
            "Vehicle yo-yo's to the specified waypoints, with science turned on.",
          secondary: 'Run by Joost Daniels on Dec 10, 2021 with 4 waypoints',
        },
      ],
    },
    {
      cells: [
        {
          label: 'Science: profile_station',
          secondary: 'Profile station at C1 for the night',
        },
        { label: 'Tethys' },
        {
          label: 'The mission yoyos in a circle around a specified location.',
          secondary: 'Run by Ben Ranaan on Dec 9, 2021 at C1',
        },
      ],
    },
    {
      cells: [
        { label: 'Science: sci2', secondary: 'more okeanids testing' },
        { label: 'Tethys' },
        {
          label:
            "Vehicle yo-yo's to the specified waypoints, with science turned on.",
          secondary: 'Run by Carlos Rueda on Aug 27, 2021 with 2 waypoints',
        },
      ],
    },
    {
      cells: [
        {
          label: 'Science: esp_sample_at_depth',
          secondary: 'send final doublet sampling mission',
        },
        { label: 'Brizo' },
        {
          label: 'This mission takes ESP samples at the designated depth.',
          secondary: 'Run by Greg Doucette on Aug 16, 2021',
        },
      ],
    },
    {
      cells: [
        {
          label: 'Maintenance: ballast_and_trim',
          secondary: 'running B&T until next sampling',
        },
        { label: 'Brizo' },
        {
          label: 'no description',
          secondary: 'Run by Greg Doucette on Aug 16, 2021',
        },
      ],
    },
  ],
}
Sortable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=3622%3A564',
  },
}

export const Scrollable = ScrollTemplate.bind({})
Scrollable.args = {
  ...args,
  scrollable: true,
  className: '',
  rows: [
    {
      cells: [
        {
          label: 'Lat1/Lon1',
          secondary:
            'Latitude of 1st waypoint. If NaN waypoint will be skipped/Longi...',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-2 opacity-60"
            />
          ),
        },
        {
          label: (
            <div className="flex items-center">
              <select className="flex-grow cursor-pointer rounded border-2 border-solid p-2">
                <option>Set waypoint</option>
              </select>
              <div className="ml-2 rounded border-2 border-solid p-2">
                <FontAwesomeIcon icon={faMapMarkerAlt as IconProp} />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      cells: [
        {
          label: 'Lat2/Lon2',
          secondary:
            'Latitude of 2nd waypoint. If NaN waypoint will be skipped/Longi...',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-2 opacity-60"
            />
          ),
        },
        {
          label: (
            <div className="flex items-center">
              <select className="flex-grow cursor-pointer rounded border-2 border-solid p-2">
                <option>Set waypoint</option>
              </select>
              <div className="ml-2 rounded border-2 border-solid p-2">
                <FontAwesomeIcon icon={faMapMarkerAlt as IconProp} />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      cells: [
        {
          label: 'Lat3/Lon3',
          secondary:
            'Latitude of 3rd waypoint. If NaN waypoint will be skipped/Longi...',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-2 opacity-60"
            />
          ),
        },
        {
          label: (
            <div className="flex items-center">
              <select className="flex-grow cursor-pointer rounded border-2 border-solid p-2">
                <option>Set waypoint</option>
              </select>
              <div className="ml-2 rounded border-2 border-solid p-2">
                <FontAwesomeIcon icon={faMapMarkerAlt as IconProp} />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      cells: [
        {
          label: 'Lat4/Lon4',
          secondary:
            'Latitude of 4th waypoint. If NaN waypoint will be skipped/Longi...',
          icon: (
            <FontAwesomeIcon
              icon={faMapMarker as IconProp}
              className="mr-2 opacity-60"
            />
          ),
        },
        {
          label: (
            <div className="flex items-center">
              <select className="flex-grow cursor-pointer rounded border-2 border-solid p-2">
                <option>Set waypoint</option>
              </select>
              <div className="ml-2 rounded border-2 border-solid p-2">
                <FontAwesomeIcon icon={faMapMarkerAlt as IconProp} />
              </div>
            </div>
          ),
        },
      ],
    },
  ],
  header: {
    cells: [
      {
        label: 'WAYPOINTS',
      },
      {
        label: 'VALUES',
        secondary: 'If NaN, waypoint will be skipped',
      },
    ],
  },
}
Scrollable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=3622%3A640',
  },
}
