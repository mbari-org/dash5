import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleDropdown } from './VehicleDropdown'
import { VehicleDropdownOption } from './VehicleDropdownOption'
import { DropdownProps } from '../Navigation'

export default {
  title: 'Dropdowns/VehicleDropdown',
  component: VehicleDropdown,
} as Meta

const Template: Story<DropdownProps> = (args) => <VehicleDropdown {...args} />

const args: DropdownProps = {
  options: [
    {
      label: (
        <VehicleDropdownOption
          name="pontus"
          status="deployed"
          missionName="Pontus 20 MBA photoshoot"
          lastEvent="5d"
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
          lastEvent="5d"
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
          lastEvent="25d"
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
          lastEvent="26d"
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
          lastEvent="28d"
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
          lastEvent="40d"
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
          lastEvent="5m"
        />
      ),
      onSelect: () => {
        console.log('makai')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="pallas"
          status="ended"
          missionName="trunk"
          lastEvent="2y"
        />
      ),
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
