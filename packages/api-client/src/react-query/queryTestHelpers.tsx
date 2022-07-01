import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { TethysApiProvider } from './TethysApiProvider'

export const mockAuthResponse = {
  result: {
    email: 'jim@sumocreations.com',
    firstName: 'Jim',
    lastName: 'Jeffers',
    roles: ['operator'],
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKaW0iLCJsYXN0TmFtZSI6IkplZmZlcnMiLCJleHAiOjE2NTM3NzgzODYsImVtYWlsIjoiamltQHN1bW9jcmVhdGlvbnMuY29tIiwicm9sZXMiOlsib3BlcmF0b3IiXX0.iIE60rpDVtL56Kt9p_Zs4MFLaDj03ISiJ9TVjr44Q24',
  },
}

export const MockProviders: React.FC<{
  queryClient: QueryClient
  testToken?: string
}> = ({ queryClient, testToken = '', children }) => (
  <QueryClientProvider client={queryClient}>
    <TethysApiProvider setSessionToken={() => {}} sessionToken={testToken}>
      {children}
    </TethysApiProvider>
  </QueryClientProvider>
)
