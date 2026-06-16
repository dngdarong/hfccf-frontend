import overview from './overview'
import student from './student'
import classroom from './classroom'
import shared from './shared'

export default {
  // Merge the report copy at the module boundary so the page keys stay flat and
  // Vue I18n lookups remain predictable across EN and KH.
  ...overview,
  ...student,
  ...classroom,
  ...shared,
}
