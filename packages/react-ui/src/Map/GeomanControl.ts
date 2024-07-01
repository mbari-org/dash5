import { createControlComponent } from '@react-leaflet/core'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { any } from 'prop-types'
import 'leaflet-easybutton/src/easy-button'
import '../css/geoManControl.css'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface Props extends L.ControlOptions {
  position: L.ControlPosition
  drawControls?: boolean
  drawCircle?: boolean
  oneBlock?: boolean
  editControls?: boolean
  editMode?: boolean
  optionsControls?: boolean
  customControls?: boolean
  enableGlobalRotateMode?: boolean
}

const Geoman = L.Control.extend({
  initialize(options: Props) {
    L.setOptions(this, options)
  },

  addTo(map: L.Map) {
    if (!map.pm) return

    var toggle = L.easyButton({
      position: 'topright',
      id: 'geoMan',
      states: [
        {
          stateName: 'add-geoman',
          title: 'Show Geometry Toolbar',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="-160 -60 600 600"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#3388FF}</style><path d="M96 151.4V360.6c9.7 5.6 17.8 13.7 23.4 23.4H328.6c0-.1 .1-.2 .1-.3l-4.5-7.9-32-56 0 0c-1.4 .1-2.8 .1-4.2 .1c-35.3 0-64-28.7-64-64s28.7-64 64-64c1.4 0 2.8 0 4.2 .1l0 0 32-56 4.5-7.9-.1-.3H119.4c-5.6 9.7-13.7 17.8-23.4 23.4zM384.3 352c35.2 .2 63.7 28.7 63.7 64c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V151.4C12.9 140.4 0 119.7 0 96C0 60.7 28.7 32 64 32c23.7 0 44.4 12.9 55.4 32H328.6c11.1-19.1 31.7-32 55.4-32c35.3 0 64 28.7 64 64c0 35.3-28.5 63.8-63.7 64l-4.5 7.9-32 56-2.3 4c4.2 8.5 6.5 18 6.5 28.1s-2.3 19.6-6.5 28.1l2.3 4 32 56 4.5 7.9z"/></svg>',
          onClick: function (control) {
            map.pm.addControls({
              //@ts-ignore
              ...this.options,
            })
            control.state('remove-geoman')
            // Check Geoman Geometry Tool Status
            if (control.state('remove-geoman')) {
              console.log('Geoman menu open!')
            }
          },
        },
        {
          stateName: 'remove-geoman',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="35px" width="35px" viewBox="-125 -80 660 640"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#3388FF}</style><path d="M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z"/></svg>',
          title: 'Hide Geometry Toolbar',
          onClick: function (control) {
            map.pm.removeControls()
            control.state('add-geoman')
            // Check Geoman Geometry Tool Status
            if (control.state('add-geoman')) {
              console.log('Geoman menu closed!')
            }
          },
        },
      ],
    })
    toggle.addTo(map)
  },
})

const createGeomanInstance = (props: Props) => {
  return new Geoman(props)
}

export const GeomanControl = createControlComponent(createGeomanInstance)
