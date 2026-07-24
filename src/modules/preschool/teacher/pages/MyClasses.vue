<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolClasses } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherMyClassesPage',
})

const { t } = useLanguage()
const router = useRouter()

const classes = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const totalPages = ref(0)

async function loadClasses() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetchMyPreschoolClasses(
      { page: currentPage.value, perPage: perPage.value }
    )
    classes.value = response.items || []
    totalPages.value = response.pagination?.totalPages || 0
  } catch {
    error.value = t('preschoolTeacherPage.classes.loadError') || 'Failed to load classes'
    classes.value = []
  } finally {
    loading.value = false
  }
}

const filteredClasses = computed(() => {
  if (!search.value) return classes.value

  const q = search.value.toLowerCase()
  return classes.value.filter(cls =>
    (cls.name && cls.name.toLowerCase().includes(q)) ||
    (cls.code && cls.code.toLowerCase().includes(q))
  )
})

function handleSearch() {
  currentPage.value = 1
  loadClasses()
}

function handlePageChange(page) {
  currentPage.value = page
  loadClasses()
}

function viewClass(classId) {
  router.push({
    name: 'dashboard-preschool-teacher-class-detail',
    params: { classId },
  })
}

onMounted(() => {
  loadClasses()
})
</script>

<template>
  <MainLayout>
    <section class="my-classes-page">
      <!-- Header -->
      <HeaderSection
        :title="t('preschoolTeacherPage.classes.title')"
        :subtitle="t('preschoolTeacherPage.classes.subtitle')"
      />

      <!-- Error Message -->
      <div v-if="error" class="error-banner">
        <i class="pi pi-exclamation-triangle" />
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" />
        <p>{{ t('preschoolTeacherPage.classes.loading') }}</p>
      </div>

      <!-- Search Bar -->
      <div v-else class="search-section">
        <div class="search-bar">
          <i class="pi pi-search" />
          <input
            v-model="search"
            type="text"
            :placeholder="t('preschoolTeacherPage.classes.searchPlaceholder')"
            @keyup.enter="handleSearch"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            rounded="lg"
            label="Search"
            :icon="`pi ${!loading ? 'pi-search' : 'pi-spin pi-spinner'}`"
            :loading="loading"
            @click="handleSearch"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredClasses.length === 0" class="empty-state">
        <i class="pi pi-inbox" />
        <p v-if="!search">{{ t('preschoolTeacherPage.classes.noClasses') }}</p>
        <p v-else>{{ t('preschoolTeacherPage.classes.noResults') }}</p>
      </div>

      <!-- Classes Table -->
      <div v-else-if="!loading" class="table-wrapper">
        <table class="classes-table">
          <thead>
            <tr>
              <th class="col-no">{{ t('common.table.number') }}</th>
              <th class="col-class">{{ t('preschoolTeacherPage.classes.columns.class') }}</th>
              <th class="col-code">{{ t('preschoolTeacherPage.classes.columns.code') }}</th>
              <th class="col-students">{{ t('preschoolTeacherPage.classes.columns.students') }}</th>
              <th class="col-year">{{ t('preschoolTeacherPage.classes.columns.year') }}</th>
              <th class="col-status">{{ t('preschoolTeacherPage.classes.columns.status') }}</th>
              <th class="col-actions">{{ t('common.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cls, index) in filteredClasses" :key="cls.id">
              <td class="col-no">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="col-class">
                <span class="class-name">{{ cls.name || '-' }}</span>
              </td>
              <td class="col-code">{{ cls.code || '-' }}</td>
              <td class="col-students">{{ cls.studentsCount ?? 0 }}</td>
              <td class="col-year">{{ cls.academic_year || '-' }}</td>
              <td class="col-status">
                <span :class="['status-badge', `status-${cls.status}`]">
                  {{ cls.status || '-' }}
                </span>
              </td>
              <td class="col-actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rounded="md"
                  :label="t('common.actions.view')"
                  @click="viewClass(cls.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <Pagination
            :model-value="currentPage"
            :total-pages="totalPages"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.my-classes-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  color: #991b1b;
  font-size: 0.9rem;
}

.error-banner i {
  font-size: 1rem;
  flex-shrink: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  text-align: center;
  gap: 1rem;
  color: #64748b;
}

.loading-state i,
.empty-state i {
  font-size: 2.5rem;
  color: #cbd5e1;
}

.loading-state p,
.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.search-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.5rem 0.9rem;
}

.search-bar i {
  color: #64748b;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #0f172a;
  font-family: inherit;
}

.search-bar input:focus {
  outline: none;
}

.search-bar input::placeholder {
  color: #94a3b8;
}

.table-wrapper {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
}

.classes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.classes-table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.classes-table th {
  padding: 0.9rem;
  text-align: left;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.classes-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;
}

.classes-table tbody tr:hover {
  background: #f8fafc;
}

.classes-table td {
  padding: 0.9rem;
  color: #0f172a;
}

.col-no {
  width: 5%;
  color: #64748b;
}

.col-class {
  width: 25%;
}

.col-code {
  width: 15%;
  color: #64748b;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
}

.col-students {
  width: 12%;
  text-align: center;
  color: #64748b;
}

.col-year {
  width: 15%;
  color: #64748b;
}

.col-status {
  width: 12%;
}

.col-actions {
  width: 16%;
  text-align: center;
}

.class-name {
  font-weight: 500;
  color: #1d4ed8;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-archived {
  background: #f3f4f6;
  color: #6b7280;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

@media (max-width: 1024px) {
  .col-year {
    display: none;
  }

  .col-class {
    width: 30%;
  }

  .col-actions {
    width: 20%;
  }
}

@media (max-width: 640px) {
  .my-classes-page {
    gap: 1rem;
  }

  .search-bar {
    flex-wrap: wrap;
  }

  .classes-table {
    font-size: 0.8rem;
  }

  .classes-table th,
  .classes-table td {
    padding: 0.6rem;
  }

  .col-no,
  .col-code,
  .col-students,
  .col-year {
    display: none;
  }

  .col-class {
    width: 100%;
  }

  .col-status {
    width: auto;
  }

  .col-actions {
    width: auto;
  }
}
</style>
