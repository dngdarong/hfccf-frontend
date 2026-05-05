<script setup>
import LiveMatchesPanel from './LiveMatchesPanel.vue'
import TodayMatchesPanel from './TodayMatchesPanel.vue'
import TopScorersPanel from './TopScorersPanel.vue'
import StandingsPanel from './StandingsPanel.vue'
</script>

<template>
  <section class="quick-panels" aria-label="Tournament quick panels">
    <div class="quick-panels__grid">
      <LiveMatchesPanel />
      <TodayMatchesPanel />
      <TopScorersPanel />
      <StandingsPanel />
    </div>
  </section>
</template>

<style scoped>
.quick-panels {
  position: relative;
}

.quick-panels__grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .quick-panels__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
