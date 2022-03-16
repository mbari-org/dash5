import React from 'react'
import { Spinner } from './Spinner'

export const FullScreen: React.FC = () => (
  <div className="flex h-screen w-screen">
    <Spinner size="4x" className="m-auto" />
  </div>
)

FullScreen.displayName = 'Indicators.FullScreen'
