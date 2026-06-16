import commandCenterMock from '@/mocks/super-admin/commandCenterData'

/**
 * Load the command center data from the local mock.
 *
 * The backend command-center endpoint is not part of the current API contract,
 * so we avoid making a dead request that would emit a 404 in the console.
 * This keeps the page deterministic until a real endpoint is introduced.
 */
export async function fetchCommandCenterData() {
  return commandCenterMock
}
