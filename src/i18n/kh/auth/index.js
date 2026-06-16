import login from './login'
import forgotPassword from './forgotPassword'
import createPassword from './createPassword'

export default {
  auth: {
    ...login.auth,
    ...forgotPassword.auth,
    ...createPassword.auth,
  },
}
