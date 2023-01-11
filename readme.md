# httpsdk

> **Note**: This is still under development

# Usage

```js
import { generateSDK } from 'httpsdk'

generateSDK({
  getUserById: {
    method: 'get',
    url: 'http://api.example.com/users/#{{id}}',
  },
})

// .generated/sdk.js

function getUserById(requestor, { id }) {
  return requestor.get(`http://api.example.com/users/${id}`)
}

export { getUserById }
```

Here the `requestor` could be any fetcher that implements `.get, .post, .put`
and other http methods.
