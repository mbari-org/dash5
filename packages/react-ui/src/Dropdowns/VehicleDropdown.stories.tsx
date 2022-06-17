import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleDropdown } from './VehicleDropdown'
import { VehicleDropdownOption } from './VehicleDropdownOption'
import { DropdownProps } from '../Navigation'
import { DateTime } from 'luxon'

export default {
  title: 'Dropdowns/VehicleDropdown',
  component: VehicleDropdown,
} as Meta

const Template: Story<DropdownProps> = (args) => <VehicleDropdown {...args} />

const current = DateTime.fromJSDate(new Date())

const args: DropdownProps = {
  options: [
    {
      label: (
        <VehicleDropdownOption
          name="pontus"
          status="deployed"
          missionName="Pontus 20 MBA photoshoot"
          lastEvent={current.plus({ days: 5 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('pontus')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="daphne"
          status="ended"
          missionName="Daphne 109 MBTS"
          lastEvent={current.plus({ days: 5 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('daphne')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="triton"
          status="ended"
          missionName="Triton 16 BoAc"
          lastEvent={current.plus({ days: 25 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('triton')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="galene"
          status="ended"
          missionName="Galene AyeRis 3"
          lastEvent={current.plus({ days: 26 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('galene')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="sim"
          status="ended"
          missionName="lrauv operator training"
          lastEvent={current.plus({ days: 28 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('sim')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="tethys"
          status="ended"
          missionName="Tethys 165 docking"
          lastEvent={current.plus({ days: 40 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('tethys')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="makai"
          status="ended"
          missionName="Makai Lake Michigan"
          lastEvent={current.plus({ months: 5.01 }).toISO()}
        />
      ),
      onSelect: () => {
        console.log('makai')
      },
    },
    {
      label: <VehicleDropdownOption name="pallas" status="ended" />,
      onSelect: () => {
        console.log('pallas')
      },
    },
  ],
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2305%3A541',
  },
}

export const Scrollable = Template.bind({})
Scrollable.args = { ...args, className: 'h-64', scrollable: true }
Scrollable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2305%3A541',
  },
}
