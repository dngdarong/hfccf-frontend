import { useTournamentCrudCatalog } from './useTournamentCrudCatalog'

// Compatibility entry point for older Tournament pages. Production state is
// backed by the shared CRUD catalog and its API service; there is no local
// or mock persistence behind this wrapper.
export function useTournamentCatalog() {
  const catalog = useTournamentCrudCatalog()

  return {
    ...catalog,
    createTournament: catalog.createTournament,
    updateTournament: catalog.updateTournament,
    removeTournament: catalog.deleteTournament,
    getTournamentById: catalog.getTournamentById,
    loadTournament: catalog.loadTournament,
    loadTournaments: catalog.loadTournaments,
  }
}
