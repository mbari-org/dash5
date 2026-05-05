export const esriTileUrl = (apiKey: string): string =>
  `https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?token=${apiKey}`
