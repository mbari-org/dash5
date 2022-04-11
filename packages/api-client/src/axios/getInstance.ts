import axios from 'axios'

export const getInstance = () =>
  axios.create({
    baseURL: process.env.API_URL,
    timeout: parseInt(process.env.API_TIMEOUT ?? '5000', 10),
  })
