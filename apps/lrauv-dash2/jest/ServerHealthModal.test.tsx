import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@mbari/api-client', () => ({
  useHealth: jest.fn(),
  useSubscribers: jest.fn(),
}))

import { useHealth, useSubscribers } from '@mbari/api-client'
import ServerHealthModal from '../components/ServerHealthModal'

const mockHealth = {
  atIso: '2026-06-19T00:00:00Z',
  asyncConnections: 2,
  freeMemory: 512 * 1024 * 1024,
  maxMemory: 2048 * 1024 * 1024,
  totalMemory: 1024 * 1024 * 1024,
  availableProcessors: 8,
  application: 'TethysDash',
  version: '5.0.0',
  build: '1234',
  appInstance: 'okeanids',
  javaVersion: '17.0.1',
}

const defaultSubscribers = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('shows loading state while health is fetching', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
    dataUpdatedAt: 0,
  })
  ;(useSubscribers as jest.Mock).mockReturnValue(defaultSubscribers)

  render(<ServerHealthModal />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('shows error state when health fetch fails', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    dataUpdatedAt: 0,
  })
  ;(useSubscribers as jest.Mock).mockReturnValue(defaultSubscribers)

  render(<ServerHealthModal />)
  expect(
    screen.getByText(/server status could not be loaded/i)
  ).toBeInTheDocument()
})

test('renders health stats when data is available', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: mockHealth,
    isLoading: false,
    isError: false,
    dataUpdatedAt: Date.now(),
  })
  ;(useSubscribers as jest.Mock).mockReturnValue(defaultSubscribers)

  render(<ServerHealthModal />)
  expect(screen.getByText('2')).toBeInTheDocument() // asyncConnections
  expect(screen.getByText('TethysDash')).toBeInTheDocument()
  expect(screen.getByText('5.0.0')).toBeInTheDocument()
})

test('renders subscriber pills with correct Dash4/Dash5 labels', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: mockHealth,
    isLoading: false,
    isError: false,
    dataUpdatedAt: Date.now(),
  })
  ;(useSubscribers as jest.Mock).mockReturnValue({
    data: {
      'dash5user@mbari.org': {
        sessions: [{ tduiv: '5.1.42', openedMs: 0, session: 'abc' }],
      },
      'dash4user@mbari.org': {
        sessions: [{ tduiv: '4.9.9', openedMs: 0, session: 'def' }],
      },
    },
    isLoading: false,
    isError: false,
    error: null,
  })

  render(<ServerHealthModal />)
  expect(screen.getByText('Dash5 (5.1.42)')).toBeInTheDocument()
  expect(screen.getByText('Dash4 (4.9.9)')).toBeInTheDocument()
})

test('shows 403 role-restriction message when subscribers returns 403', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: mockHealth,
    isLoading: false,
    isError: false,
    dataUpdatedAt: Date.now(),
  })
  ;(useSubscribers as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    error: { response: { status: 403 } },
  })

  render(<ServerHealthModal />)
  expect(screen.getByText(/operator or admin role/i)).toBeInTheDocument()
})

test('shows generic error for non-403 subscriber failures', () => {
  ;(useHealth as jest.Mock).mockReturnValue({
    data: mockHealth,
    isLoading: false,
    isError: false,
    dataUpdatedAt: Date.now(),
  })
  ;(useSubscribers as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    error: { response: { status: 500 } },
  })

  render(<ServerHealthModal />)
  expect(
    screen.getByText(/could not load connected users/i)
  ).toBeInTheDocument()
})
