<script setup>
defineOptions({
  name: 'TournamentStandingsCard',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="standings-card">
    <div v-if="title || subtitle" class="standings-card__head">
      <div>
        <h3 v-if="title" class="standings-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="standings-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <slot />
  </section>
</template>

<style scoped>
.standings-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(141, 198, 63, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.standings-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.standings-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}
</style>
