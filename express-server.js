// 临时秘钥
const bodyParser = require('body-parser')
const STS = require('qcloud-cos-sts')
const express = require('express')

const crypto = require('crypto')
const pathLib = require('path')
const fs = require('fs')

const config = {
  secretId: '',
  secretKey: '',

  // proxy: process.env.Proxy,
  durationSeconds: 1800,
  bucket: 'vanlee-',
  region: 'ap-beijing',
  // 允许操作（上传）的对象前缀，可以根据自己网站的用户登录态判断允许上传的目录，例子： user1/* 或者 * 或者a.jpg
  // 请注意当使用 * 时，可能存在安全风险，详情请参阅：https://cloud.tencent.com/document/product/436/40265
  allowPrefix: '_ALLOW_DIR_/*',
  allowActions: [
    // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
    // 简单上传
    'name/cos:PutObject',
    'name/cos:PostObject',
    // 分片上传
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload',
  ],
}

const app = express()
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.all('/sts', (req, res, next) => {
  console.log('213')
  const AppId = config.bucket.substr(config.bucket.lastIndexOf('-') + 1)

  const policy = {
    version: '2.0',
    statement: [
      {
        action: config.allowActions,
        effect: 'allow',
        resource: [
          'qcs::cos:' +
            config.region +
            ':uid/' +
            AppId +
            ':' +
            config.bucket +
            '/' +
            config.allowPrefix,
        ],
      },
    ],
  }
  const startTime = Math.round(Date.now() / 1000)

  STS.getCredential(
    {
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      region: config.region,
      durationSeconds: config.durationSeconds,
      policy: policy,
    },
    function (err, tempKeys) {
      if (tempKeys) tempKeys.startTime = startTime
      res.send(err || tempKeys)
    }
  )
})

app.all('*', (req, res, next) => {
  res.send({ code: -1, message: '404 Not Found' })
})

// 启动签名服务
app.listen(3000)
console.log('app is listening at http://127.0.0.1:3000')
