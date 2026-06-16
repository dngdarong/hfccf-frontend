import common from './dashboard/common'
import app from './dashboard/app'
import nav from './dashboard/nav'
import pages from './dashboard/pages'
import commandCenter from './dashboard/command-center'
import notifications from './dashboard/notifications'
import users from './users'
import auth from './auth'
import sportAdminDashboard from './sport/admin-dashboard'
import preschoolAdminDashboard from './preschool/admin-dashboard'

export default {
  common,
  app,
  nav,
  pages,
  commandCenter,
  notifications,
  users,
  auth,
  dashboard: {
    nav: {
      logoutCaption: nav.logoutCaption,
    },
  },
  ...sportAdminDashboard,
  ...preschoolAdminDashboard,
}
