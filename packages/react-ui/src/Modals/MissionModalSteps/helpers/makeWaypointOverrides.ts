import { ParameterProps } from '../../../Tables/ParameterTable'
import { WaypointProps } from '../../../Tables/WaypointTable'

const makeWaypointOverrides = (
  updatedWaypoints: WaypointProps[],
  parameters: ParameterProps[]
) =>
  updatedWaypoints
    .map((wp) => ({
      wp,
      lat: parameters.find((p) => p.name === wp.latName),
      lon: parameters.find((p) => p.name === wp.lonName),
    }))
    .filter(({ wp, lat, lon }) => {
      return lat?.value !== wp.lat || lon?.value !== wp.lon
    })
    .reduce((acc, { wp, lat, lon }): ParameterProps[] => {
      if (lat && lat?.value !== wp.lat) {
        acc.push({
          ...lat,
          overrideValue: wp.lat,
        })
      }
      if (lon && lon?.value !== wp.lon) {
        acc.push({
          ...lon,
          overrideValue: wp.lon,
        })
      }
      return acc
    }, [] as ParameterProps[])

export default makeWaypointOverrides
