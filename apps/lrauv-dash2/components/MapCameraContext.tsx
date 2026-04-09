import React, { createContext, useContext, useState } from 'react'

export interface FlyToRequest {
  lat: number
  lon: number
  bounds?: [[number, number], [number, number]]
}

interface MapCameraContextProps {
  flyToRequest: FlyToRequest | null
  setFlyToRequest: React.Dispatch<React.SetStateAction<FlyToRequest | null>>
}

const MapCameraContext = createContext<MapCameraContextProps | undefined>(
  undefined
)

export const MapCameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null)

  return (
    <MapCameraContext.Provider value={{ flyToRequest, setFlyToRequest }}>
      {children}
    </MapCameraContext.Provider>
  )
}

export const useMapCamera = (): MapCameraContextProps => {
  const ctx = useContext(MapCameraContext)
  if (!ctx)
    throw new Error('useMapCamera must be used within MapCameraProvider')
  return ctx
}
