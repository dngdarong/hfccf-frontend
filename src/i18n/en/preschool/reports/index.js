import overview from './overview'
import student from './student'
import classroom from './classroom'
import shared from './shared'

export default {
  // Keep report keys merged at the Preschool module boundary so pages can read
  // t('preschoolReportsPage.*') and related page keys without double nesting.
  ...overview,
  ...student,
  ...classroom,
  ...shared,
}
