__webpack_public_path__ = BRRL_PATH(BRRL_PUBLIC_PATH) // eslint-disable-line camelcase

import app from 'lib/init'

document.addEventListener('DOMContentLoaded', () => {
  app.init()
})
