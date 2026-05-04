export const esriTileUrl = (
  apiKey: string | undefined = process.env.NEXT_PUBLIC_ESRI_API_KEY
): string =>
  `https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?token=${
    apiKey ?? ''
  }`
