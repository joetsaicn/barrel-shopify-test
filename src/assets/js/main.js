import app from 'lib/init'
__webpack_public_path__ = BRRL_PATH(BRRL_PUBLIC_PATH) // eslint-disable-line

document.addEventListener('DOMContentLoaded', () => {
  app.init()
})
