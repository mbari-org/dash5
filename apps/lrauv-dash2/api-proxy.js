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
  '',
  createProxyMiddleware({
    target: 'https://okeanids.mbari.org/',
    changeOrigin: true,
    selfHandleResponse: true,

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
    onProxyRes: responseInterceptor(async (responseBuffer) => {
      return responseBuffer.toString('utf8')
    }),
  })
)
app.listen(process.env.PORT)
