import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useModuleInfo } from './useModuleInfo'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Command/getModuleInfo.test'

const server = setupServer(
  rest.get('/commands/moduleInfo', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVerticleControl: React.FC = () => {
  const query = useModuleInfo()

  return query.isLoading ? null : (
    <div>
      <span data-testid="element-name">
        {query.data?.configUris?.Control?.VerticalControl?.[0].string ??
          'Loading'}
      </span>
      <span data-testid="element-description">
        {query.data?.configUris?.Control?.VerticalControl?.[0].description ??
          'Loading'}
      </span>
    </div>
  )
}
const MockNavigation: React.FC = () => {
  const query = useModuleInfo()

  return query.isLoading ? null : (
    <div>
      <span data-testid="element">
        {query.data?.sensors.Navigation[0].string ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useModuleInfo', () => {
  it('should display the element name in a module', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVerticleControl />
      </MockProviders>
    )
    const elementName =
      mockResponse.result.configUris.Control.VerticalControl[0].string
    await waitFor(() => {
      return screen.getByText(elementName)
    })

    expect(screen.getByTestId('element-name')).toHaveTextContent(elementName)
  })

  it('should display the element description in a module', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVerticleControl />
      </MockProviders>
    )

    const elementDescription =
      `${mockResponse.result.configUris.Control.VerticalControl[0].description}`
        .trim()
        .slice(0, -2)

    const descriptionRegEx = new RegExp(elementDescription, 'i')

    await waitFor(() => {
      return screen.getByText(descriptionRegEx)
    })

    expect(screen.getByTestId('element-description')).toHaveTextContent(
      elementDescription
    )
  })

  it('should display the element name in a component', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockNavigation />
      </MockProviders>
    )
    const element = mockResponse.result.sensors.Navigation[0].string
    await waitFor(() => {
      return screen.getByText(element)
    })

    expect(screen.getByTestId('element')).toHaveTextContent(element)
  })
})
