<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  icon: {
    type: [Object, Function, String],
    default: null,
  },
  iconClass: {
    type: String,
    default: 'sidebar-link__icon',
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  exact: {
    type: Boolean,
    default: false,
  },
  activeClass: {
    type: String,
    default: 'sidebar-link--active',
  },
  inactiveClass: {
    type: String,
    default: '',
  },
  forceActive: {
    type: Boolean,
    default: false,
  },
})

const resolvedActiveClass = computed(() => props.activeClass || 'sidebar-link--active')

function isLinkActive(isActive, isExactActive) {
  return props.forceActive || (props.exact ? isExactActive : isActive)
}
</script>

<template>
  <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" :to="to" custom>
    <a
      :href="href"
      class="sidebar-link flex items-center gap-3 rounded-2xl border border-transparent px-[0.82rem] py-[0.72rem] text-surface-600 no-underline transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-base)_18%,white)] hover:bg-white hover:text-surface-900 hover:shadow-[0_10px_22px_-22px_rgba(15,23,42,0.12)]"
      :class="[
        isLinkActive(isActive, isExactActive) ? resolvedActiveClass : inactiveClass,
        {
          'sidebar-link--collapsed justify-center !w-12 !min-w-12 !px-[0.45rem] mx-auto': collapsed,
        },
      ]"
      @click="navigate"
    >
      <component
        :is="icon"
        v-if="icon"
        :class="[iconClass, 'h-[1.1rem] w-[1.1rem] shrink-0 overflow-visible text-current']"
        aria-hidden="true"
      />

      <slot :is-active="isLinkActive(isActive, isExactActive)" />
    </a>
  </RouterLink>
</template>

<style scoped>
.sidebar-link--active {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-base) 8%, white) 0%,
    color-mix(in srgb, var(--color-base) 16%, white) 100%
  );
  color: #0f172a;
  border-color: color-mix(in srgb, var(--color-base) 28%, white);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 14px 24px -24px color-mix(in srgb, var(--color-base) 40%, transparent);
  font-weight: 700;
}

.sidebar-link--active .sidebar-link__icon {
  color: var(--color-base);
}
</style>
