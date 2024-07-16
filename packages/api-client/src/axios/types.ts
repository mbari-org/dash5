import { AxiosInstance, AxiosRequestHeaders } from 'axios'

export interface RequestConfig {
  debug?: boolean
  instance?: AxiosInstance
  headers?: AxiosRequestHeaders
  baseURL?: string
}
