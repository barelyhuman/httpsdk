import fs from 'node:fs'
import test from 'ava'
import { generateSDK } from './index.js'

test('creates functions', t => {
  generateSDK({
    getUserById: {
      method: 'get',
      url: 'http://api.example.com/users/#{{id}}',
      headers: {
        authorization: '#{{authToken}}',
      },
    },
  })

  t.true(fs.existsSync('.generated/sdk.js'))
})
