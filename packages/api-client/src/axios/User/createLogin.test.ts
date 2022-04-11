jest.unmock('axios') // Do this just in case the library is already mocked

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { createLogin } from './createLogin'

describe('createLogin', () => {
  let params = {
    email: 'some-user@example.com',
    password: 'some-password',
  }

  let mock: MockAdapter

  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('should return the authentication token when successful', async () => {
    const mockResponse = { token: 'authentication-token' }
    mock.onPost('/user/auth').reply(200, mockResponse)

    const { token } = await createLogin(params)

    expect(mock.history.post[0].url).toEqual('/user/auth')
    expect(token).toEqual(mockResponse.token)
  })

  it('should throw when unsuccessful', async () => {
    mock.onPost('/user/auth').reply(500)

    try {
      await createLogin(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
