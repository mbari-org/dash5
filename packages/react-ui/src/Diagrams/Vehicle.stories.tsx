import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Vehicle, VehicleProps } from './Vehicle'

export default {
  title: 'Diagrams/Vehicle',
  component: Vehicle,
} as Meta

const Template: Story<VehicleProps> = (args) => <Vehicle {...args} />

const args: VehicleProps = {
  textVehicle: 'BRIZO',
  status: 'onMission',
  textMission: 'sci2 - 12:47 • 24May22',
  textLastUpdate: '11:50',
  colorDirtbox: 'st18',
  colorWavecolor: 'st0',
  colorSmallCable: 'st18',
  colorBigCable: 'st18',
  colorDrop: 'st6',
  colorGf: 'st3',
  colorHw: 'st3',
  colorSw: 'st3',
  colorThrust: 'st3',
  colorArrow: 'st16',
  textArriveLabel: 'Arrive Station',
}

export const Deployed = Template.bind({})
Deployed.args = {
  ...args,
  colorMissionDefault: 'st25',
  textArrow: '15',
  textThrustTime: '2.8km/hr',
  textReckonDistance: '3.3km in 1.0h',
  colorDvl: 'st4',
  textDvlStatus: 'ON',
  textDroptime: 'over 4 days ago',
  textGps: '12:47',
  colorGps: 'st4',
  textGpsAgo: '50m ago',
  colorGf: 'st4',
  textGf: '-0.14',
  textGfTime: '40m ago',
  textSpeed: '1.10m/s',
  colorHw: 'st5',
  colorThrust: 'st4',
  colorBat1: 'st4',
  colorBat2: 'st4',
  colorBat3: 'st4',
  colorBat4: 'st11',
  colorBat5: 'st11',
  colorBat6: 'st11',
  colorBat7: 'st11',
  colorBat8: 'st11',
  textVolts: '14.5',
  textAmps: '0.0',
  textAmpAgo: '50m ago',
  colorVolts: 'st5',
  colorAmps: 'st5',
  textNextComm: '13:48 in 10m',
  colorNextComm: 'st4',
  textTimeout: '17:47 - in 4h 9m',
  colorMissionAgo: 'st4',
  textSat: '10:28',
  textCommAgo: '3h 9m ago',
  colorSatComm: 'st6',
  textCell: '12:48',
  textCellAgo: '49m ago',
  colorCell: 'st5',
  textLogTime: '13:31',
  textLogAgo: '1d 0h 6m ago',
  textArriveStation: 'Arrived at WP',
  textStationDist: '3h 33m ago',
}

Deployed.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_brizo.svg?dummy=1653078296172',
  },
}

export const CriticalLeak = Template.bind({})
CriticalLeak.args = {
  ...Deployed.args,
  colorLeak: 'stleak2',
  textLeak: 'CRITICAL LEAK',
  textLeakAgo: '1h 9m ago',
}

CriticalLeak.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_brizo.svg?dummy=1653078296172',
  },
}

export const AuxLeak = Template.bind({})
AuxLeak.args = {
  ...Deployed.args,
  colorLeak: 'stleak1',
  textLeak: 'AUX LEAK',
  textLeakAgo: '1h 9m ago',
}

AuxLeak.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_brizo.svg?dummy=1653078296172',
  },
}

export const Scheduled = Template.bind({})
Scheduled.args = {
  ...args,
  textVehicle: 'GALENE',
  colorMissionDefault: 'st25',
  textArrow: '282',
  textThrustTime: '1.4km/hr',
  textReckonDistance: '1.5km in 1.0h',
  textMission: 'sci2_backseat - 13:26 • 24May22',
  textScheduled: 'sci2_backseat',
  colorScheduled: 'st25',
  textDroptime: 'over 4 days ago',
  batteryVolts: 16.3,
  textGf: 'NA',
  textGfTime: 'no scan',
  textSpeed: '1.00m/s',
  colorThrust: 'st4',
  colorBat1: 'st4',
  colorBat2: 'st4',
  colorBat3: 'st4',
  colorBat4: 'st4',
  colorBat5: 'st4',
  colorBat6: 'st4',
  colorBat7: 'st4',
  colorBat8: 'st11',
  textVolts: '16.3',
  textAmps: '357.3',
  textAmpAgo: '20m ago',
  colorVolts: 'st4',
  colorAmps: 'st4',
  textNextComm: '15:32 - in 42m',
  colorNextComm: 'st4',
  textTimeout: '01:26 - in 10h 36m',
  colorMissionAgo: 'st4',
  textSat: '14:32',
  textCommAgo: '17m ago',
  colorSatComm: 'st5',
  textCell: '14:32',
  textCellAgo: '17m ago',
  colorCell: 'st5',
  textGps: '14:29',
  colorGps: 'st4',
  textGpsAgo: '20m ago',
  colorDvl: 'st5',
  textDvlStatus: 'OFF',
  textLogTime: '11:34',
  textLogAgo: '3h 15m ago',
  textArriveStation: '09:40 - in 58m',
  textStationDist: '4.9km from last fix',
  textCurrentDist: '2.4km from est.veh',
  textCriticalError: 'A critical error has occurred perhaps',
  textCriticalTime: 'Time of error: 11:11',
  textFlow: 'flow text',
  colorFlow: 'st4',
  ubatColor: 'st5',
}
Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_galene.svg?dummy=1653078296172',
  },
}
export const Recovered = Template.bind({})
Recovered.args = {
  ...args,
  textVehicle: 'MAKAI',
  status: 'recovered',
  textMission: 'RECOVERED 10:11 • 26May22',
  colorDirtbox: 'st17',
  colorWavecolor: 'st18',
  colorDrop: 'st3',
  colorCart: 'st3',
  colorCartCircle: 'st18',
}
Recovered.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_makai.svg?dummy=1653078296172',
  },
}
export const PluggedIn = Template.bind({})
PluggedIn.args = {
  ...args,
  textVehicle: 'DAPHNE',
  status: 'pluggedIn',
  textMission: 'PLUGGED IN 08:49 • 19May22',
  colorDirtbox: 'st17',
  colorWavecolor: 'st18',
  colorSmallCable: 'st23',
  colorBigCable: 'st22',
  colorDrop: 'st3',
  colorCart: 'st19',
  colorCartCircle: 'st17',
}
PluggedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_daphne.svg?dummy=1653078296172',
  },
}
