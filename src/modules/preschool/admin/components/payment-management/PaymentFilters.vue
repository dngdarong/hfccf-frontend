<script setup>
// Keep the filter labels configurable so the page can stay locale-driven and
// the component does not hardcode English fallback copy.
defineOptions({
  name: 'PaymentFilters',
})

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  classFilter: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
  classOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  searchPlaceholder: {
    type: String,
    default: '',
  },
  allClassesLabel: {
    type: String,
    default: '',
  },
  allStatusLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['update:searchQuery', 'update:classFilter', 'update:statusFilter'])
</script>

<template>
  <div class="payment-filters">
    <input
      :value="searchQuery"
      type="search"
      class="payment-filters__input payment-filters__search"
      :placeholder="searchPlaceholder"
      @input="$emit('update:searchQuery', $event.target.value)"
    >

    <select
      :value="classFilter"
      class="payment-filters__input"
      @change="$emit('update:classFilter', $event.target.value)"
    >
      <option value="">
        {{ allClassesLabel }}
      </option>
      <option
        v-for="option in classOptions"
        :key="option.value ?? option"
        :value="option.value ?? option"
      >
        {{ option.label ?? option }}
      </option>
    </select>

    <select
      :value="statusFilter"
      class="payment-filters__input"
      @change="$emit('update:statusFilter', $event.target.value)"
    >
      <option value="">
        {{ allStatusLabel }}
      </option>
      <option
        v-for="option in statusOptions"
        :key="option.value ?? option"
        :value="option.value ?? option"
      >
        {{ option.label ?? option }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.payment-filters {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(180px, 1fr));
  gap: 0.75rem;
}

.payment-filters__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

@media (max-width: 900px) {
  .payment-filters {
    grid-template-columns: 1fr;
  }
}
</style>
