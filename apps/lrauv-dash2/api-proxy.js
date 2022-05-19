/* eslint-disable */
const express = require('express')
var bodyParser = require('body-parser')
const {
  createProxyMiddleware,
  responseInterceptor,
} = require('http-proxy-middleware')
var cors = require('cors')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) // support json encoded bodies
app.use(
  '/TethysDash/api',
  createProxyMiddleware({
    target: 'https://okeanids.mbari.org/',
    changeOrigin: true,
    selfHandleResponse: true,
    logger: console,
    secure: false,
    headers: {
      'Content-Type': 'application/json',
    },

    onProxyReq: (proxyReq, req, res) => {
      if (req.body) {
        let bodyData = JSON.stringify(req.body)
        proxyReq.setHeader('Content-Type', 'application/json')
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }
    },
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req) => {
      console.log('Processing request:', req.path)
      const response = responseBuffer.toString('utf8')
      console.log('Intercepted response:', proxyRes.statusCode, response)
      return response
    }),
  })
)
app.listen(process.env.PORT)
