import axios from 'axios'

export const getInstance = (config?: { baseURL?: string }) =>
  axios.create({
    baseURL: config?.baseURL ?? process.env.API_URL,
    timeout: parseInt(process.env.API_TIMEOUT ?? '5000', 10),
  })
