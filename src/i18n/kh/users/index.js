import manageUsers from './manageUsers'
import addUser from './addUser'
import viewUser from './viewUser'
import roles from './roles'
import permissions from './permissions'

export default {
  ...manageUsers,
  ...addUser,
  ...viewUser,
  ...roles,
  ...permissions,
}
