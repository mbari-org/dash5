import L from 'leaflet'

const DEFAULT_OPTIONS = {
  activeColor: '#ABE67E',
  completedColor: '#C8F2BE',
}

export interface SymbologyProps {
  clickable?: boolean
  radius?: number
  color?: string
  weight?: number
  opacity?: number
  fillColor?: string
  fillOpacity?: number
  className?: string
}

export default class Symbology {
  constructor(options: any) {
    options = L.extend({}, DEFAULT_OPTIONS, options, options)
  }

  getSymbol(name: string) {
    const symbols: { [key: string]: any } = {
      measureDrag: {
        clickable: false,
        radius: 4,
        color: '#ABE67E',
        weight: 2,
        opacity: 0.7,
        fillColor: '#ABE67E',
        fillOpacity: 0.5,
        className: 'layer-measuredrag',
      },
      measureArea: {
        clickable: false,
        stroke: false,
        fillColor: '#ABE67E',
        fillOpacity: 0.2,
        className: 'layer-measurearea',
      },
      measureBoundary: {
        clickable: false,
        color: '#ABE67E',
        weight: 2,
        opacity: 0.9,
        fill: false,
        className: 'layer-measureboundary',
      },
      measureVertex: {
        clickable: false,
        radius: 4,
        color: '#ABE67E',
        weight: 2,
        opacity: 1,
        fillColor: '#ABE67E',
        fillOpacity: 0.7,
        className: 'layer-measurevertex',
      },
      measureVertexActive: {
        clickable: false,
        radius: 4,
        color: '#ABE67E',
        weight: 2,
        opacity: 1,
        fillColor: '#ABE67E',
        fillOpacity: 1,
        className: 'layer-measurevertex active',
      },
      resultArea: {
        clickable: true,
        color: '#C8F2BE',
        weight: 2,
        opacity: 0.9,
        fillColor: '#C8F2BE',
        fillOpacity: 0.2,
        className: 'layer-measure-resultarea',
      },
      resultLine: {
        clickable: true,
        color: '#C8F2BE',
        weight: 3,
        opacity: 0.9,
        fill: false,
        className: 'layer-measure-resultline',
      },
      resultPoint: {
        clickable: true,
        radius: 4,
        color: '#C8F2BE',
        weight: 2,
        opacity: 1,
        fillColor: '#C8F2BE',
        fillOpacity: 0.7,
        className: 'layer-measure-resultpoint',
      },
    }
    return symbols[name]
  }
}
