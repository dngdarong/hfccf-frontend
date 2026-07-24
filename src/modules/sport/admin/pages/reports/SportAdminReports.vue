<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import logoUrl from '@/assets/images/logo.jpg'
import { useLanguage } from '@/composables/useLanguage'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'
import {
  fetchSportDivisions,
  fetchSportTeams,
  fetchSportPlayers,
} from '@/modules/sport/services/sportApi'
import {
  fetchSportMatchesReport,
  downloadSportMatchesReportPdf,
} from '@/modules/sport/services/api/sportMatchesReportApi'
import { fetchSportTournaments } from '@/modules/sport/services/api/sportTournamentsApi'
import {
  fetchSportStandingsReport,
  downloadSportStandingsReportPdf,
  downloadSportStandingsReportExcel,
} from '@/modules/sport/services/api/sportStandingsReportsApi'
import {
  fetchSportPlayerStatisticsReport,
  downloadSportPlayerStatisticsReportPdf,
  downloadSportPlayerStatisticsReportExcel,
} from '@/modules/sport/services/api/sportPlayerStatisticsApi'

defineOptions({
  name: 'SportAdminReportsPage',
})

const { t } = useLanguage()

// State
const loading = ref(false)
const reportType = ref('overview')
const dateFrom = ref(null)
const dateTo = ref(null)
const selectedDivision = ref(null)
const selectedTeam = ref(null)
const selectedTournament = ref(null)

const reportGenerated = ref(false)
const errorMessage = ref('')
const exportLoading = ref(false)

// Data
const divisions = ref([])
const teams = ref([])
const tournaments = ref([])
const players = ref([])
const matchesData = ref([])
const standingsData = ref([])
const playersData = ref([])
const statisticsData = ref({})

// Computed
const reportTitle = computed(() => {
  const titles = {
    overview: t('sportAdminReports.types.overview') || 'Overview Report',
    matches: t('sportAdminReports.types.matches') || 'Matches Report',
    standings: t('sportAdminReports.types.standings') || 'Standings Report',
    players: t('sportAdminReports.types.players') || 'Player Statistics',
    attendance: t('sportAdminReports.types.attendance') || 'Attendance Report',
  }
  return titles[reportType.value] || 'Sports Report'
})

const canGenerate = computed(() => {
  return dateFrom.value && dateTo.value
})

const filteredMatches = computed(() => {
  let filtered = matchesData.value || []

  if (selectedDivision.value) {
    filtered = filtered.filter(m => m.divisionId === selectedDivision.value)
  }
  if (selectedTeam.value) {
    filtered = filtered.filter(m => m.homeTeamId === selectedTeam.value || m.awayTeamId === selectedTeam.value)
  }
  if (selectedTournament.value) {
    filtered = filtered.filter(m => m.tournamentId === selectedTournament.value)
  }

  return filtered
})

// Methods
async function loadFilterData() {
  try {
    loading.value = true
    const [divsResponse, teamsResponse, tournamentsResponse, playersResponse] = await Promise.allSettled([
      fetchSportDivisions(),
      fetchSportTeams(),
      fetchSportTournaments(),
      fetchSportPlayers(),
    ])

    if (divsResponse.status === 'fulfilled') {
      divisions.value = (divsResponse.value.items || []).map(d => ({
        label: d.name,
        value: d.id,
      }))
    }

    if (teamsResponse.status === 'fulfilled') {
      teams.value = (teamsResponse.value.items || []).map(t => ({
        label: t.name,
        value: t.id,
      }))
    }

    if (tournamentsResponse.status === 'fulfilled') {
      tournaments.value = (tournamentsResponse.value.items || []).map(t => ({
        label: t.name,
        value: t.id,
      }))
    }

    if (playersResponse.status === 'fulfilled') {
      players.value = (playersResponse.value.items || []).map(p => ({
        label: `${p.firstName} ${p.lastName}`,
        value: p.id,
      }))
    }
  } catch (error) {
    errorMessage.value = t('sportAdminReports.errors.loadFailed') || 'Failed to load filter options'
    console.error('Error loading filter data:', error)
  } finally {
    loading.value = false
  }
}

async function generateReport() {
  try {
    loading.value = true
    errorMessage.value = ''

    if (reportType.value === 'matches') {
      const report = await fetchSportMatchesReport({
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        divisionId: selectedDivision.value,
        teamId: selectedTeam.value,
        tournamentId: selectedTournament.value,
      })

      matchesData.value = report.matches
      statisticsData.value = report.summary
      reportGenerated.value = true
      return
    }

    if (reportType.value === 'standings') {
      const report = await fetchSportStandingsReport({
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        divisionId: selectedDivision.value,
        teamId: selectedTeam.value,
        tournamentId: selectedTournament.value,
      })

      standingsData.value = report.standings
      statisticsData.value = report.summary
      reportGenerated.value = true
      return
    }

    if (reportType.value === 'players') {
      const report = await fetchSportPlayerStatisticsReport({
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        divisionId: selectedDivision.value,
        teamId: selectedTeam.value,
        tournamentId: selectedTournament.value,
      })

      playersData.value = report.players
      statisticsData.value = report.summary
      reportGenerated.value = true
      return
    }

    // Build report based on type
    // Simulate fetching report data
    // In real implementation, call backend API
    matchesData.value = [
      {
        id: '1',
        homeTeamId: selectedTeam.value || 't1',
        awayTeamId: 't2',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 2,
        date: '2026-07-15',
        divisionId: selectedDivision.value || 'd1',
        tournamentId: selectedTournament.value,
        status: 'completed',
      },
      {
        id: '2',
        homeTeamId: 't3',
        awayTeamId: 't4',
        homeTeam: 'Team C',
        awayTeam: 'Team D',
        homeScore: 1,
        awayScore: 1,
        date: '2026-07-14',
        divisionId: selectedDivision.value || 'd1',
        tournamentId: selectedTournament.value,
        status: 'completed',
      },
    ]

    statisticsData.value = {
      totalMatches: 10,
      completedMatches: 8,
      upcomingMatches: 2,
      totalTeams: 4,
      totalPlayers: 50,
      averageAttendance: 85,
    }

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = t('sportAdminReports.errors.generateFailed') || 'Failed to generate report'
    console.error('Error generating report:', error)
  } finally {
    loading.value = false
  }
}

async function exportReport(format) {
  try {
    exportLoading.value = true

    // Build filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `SportReport_${reportType.value}_${timestamp}`

    if (format === 'pdf') {
      await exportToPdf(filename)
    } else if (format === 'excel') {
      await exportToExcel(filename)
    } else if (format === 'print') {
      window.print()
    }
  } catch (error) {
    errorMessage.value = t('sportAdminReports.errors.exportFailed') || 'Failed to export report'
    console.error('Error exporting report:', error)
  } finally {
    exportLoading.value = false
  }
}

async function exportToPdf(filename) {
  if (reportType.value === 'matches') {
    const exportData = await downloadSportMatchesReportPdf({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.pdf`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Matches PDF export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  if (reportType.value === 'standings') {
    const exportData = await downloadSportStandingsReportPdf({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.pdf`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Standings PDF export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  if (reportType.value === 'players') {
    const exportData = await downloadSportPlayerStatisticsReportPdf({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.pdf`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Player Statistics PDF export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  const element = document.querySelector('.sport-admin-reports__pdf-export')
  if (!element) {
    throw new Error('PDF report content not found')
  }

  const options = {
    margin: [10, 10, 14, 10],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  }

  await html2pdf()
    .set(options)
    .from(element)
    .toPdf()
    .get('pdf')
    .then(pdf => {
      const pageCount = pdf.internal.getNumberOfPages()
      pdf.setFontSize(8)
      pdf.setTextColor(100, 116, 139)
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page)
        pdf.text(`Page ${page} of ${pageCount}`, 190, 287, { align: 'right' })
      }
    })
    .save()
}

function formatReportDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatMatchScore(match) {
  return `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
}

function selectedOptionLabel(options, value) {
  return options.find(option => option.value === value)?.label || 'All'
}

async function exportToExcel(filename) {
  const workbook = XLSX.utils.book_new()

  if (reportType.value === 'matches') {
    const exportData = await downloadSportMatchesReportExcel({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.xlsx`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Matches Excel export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  if (reportType.value === 'standings') {
    const exportData = await downloadSportStandingsReportExcel({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.xlsx`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Standings Excel export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  if (reportType.value === 'players') {
    const exportData = await downloadSportPlayerStatisticsReportExcel({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      divisionId: selectedDivision.value,
      teamId: selectedTeam.value,
      tournamentId: selectedTournament.value,
      filename: `${filename}.xlsx`,
    })

    if (!(exportData.blob instanceof Blob) || exportData.blob.size === 0) {
      throw new Error('Sport Player Statistics Excel export returned an empty file.')
    }

    const url = URL.createObjectURL(exportData.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportData.filename || `${filename}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return
  }

  // Statistics sheet
  const statsData = [
    ['Metric', 'Value'],
    ['Total Matches', statisticsData.value.totalMatches || 0],
    ['Completed Matches', statisticsData.value.completedMatches || 0],
    ['Upcoming Matches', statisticsData.value.upcomingMatches || 0],
    ['Total Teams', statisticsData.value.totalTeams || 0],
    ['Total Players', statisticsData.value.totalPlayers || 0],
    ['Average Attendance', statisticsData.value.averageAttendance || 0],
  ]
  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics')

  // Matches sheet
  if (filteredMatches.value && filteredMatches.value.length > 0) {
    const matchesSheetData = filteredMatches.value.map(m => [
      m.homeTeam || '',
      m.awayTeam || '',
      `${m.homeScore || 0} - ${m.awayScore || 0}`,
      m.date || '',
      m.status || '',
    ])
    matchesSheetData.unshift(['Home Team', 'Away Team', 'Score', 'Date', 'Status'])

    const matchesSheet = XLSX.utils.aoa_to_sheet(matchesSheetData)
    XLSX.utils.book_append_sheet(workbook, matchesSheet, 'Matches')
  }

  // Report metadata sheet
  const metaData = [
    ['Report Information'],
    ['Type', reportType.value || 'N/A'],
    ['Generated On', new Date().toLocaleString()],
    ['From Date', dateFrom.value ? new Date(dateFrom.value).toLocaleDateString() : 'N/A'],
    ['To Date', dateTo.value ? new Date(dateTo.value).toLocaleDateString() : 'N/A'],
  ]
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData)
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Report Info')

  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Lifecycle
onMounted(() => {
  loadFilterData()
})
</script>

<template>
  <MainLayout>
    <section class="sport-admin-reports">
      <HeaderSection
        :title="t('sportAdminReports.title') || 'Sport Reports'"
        :subtitle="t('sportAdminReports.subtitle') || 'Generate and analyze sports data reports'"
      />

      <!-- Filter Section -->
      <Card class="sport-admin-reports__filters">
        <template #title>{{ t('sportAdminReports.filters.title') || 'Report Filters' }}</template>
        <template #content>
          <div class="filters-grid">
            <!-- Date Range -->
            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.dateFrom') || 'From Date' }}</label>
              <DatePicker
                v-model="dateFrom"
                :placeholder="t('sportAdminReports.filters.selectDate') || 'Select date'"
                date-format="yy-mm-dd"
              />
            </div>

            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.dateTo') || 'To Date' }}</label>
              <DatePicker
                v-model="dateTo"
                :placeholder="t('sportAdminReports.filters.selectDate') || 'Select date'"
                date-format="yy-mm-dd"
              />
            </div>

            <!-- Division -->
            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.division') || 'Division' }}</label>
              <Select
                v-model="selectedDivision"
                :options="divisions"
                option-label="label"
                option-value="value"
                :placeholder="t('sportAdminReports.filters.selectDivision') || 'Select division'"
              />
            </div>

            <!-- Team -->
            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.team') || 'Team' }}</label>
              <Select
                v-model="selectedTeam"
                :options="teams"
                option-label="label"
                option-value="value"
                :placeholder="t('sportAdminReports.filters.selectTeam') || 'Select team'"
              />
            </div>

            <!-- Tournament -->
            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.tournament') || 'Tournament' }}</label>
              <Select
                v-model="selectedTournament"
                :options="tournaments"
                option-label="label"
                option-value="value"
                :placeholder="t('sportAdminReports.filters.selectTournament') || 'Select tournament'"
              />
            </div>

            <!-- Report Type -->
            <div class="filter-group">
              <label>{{ t('sportAdminReports.filters.reportType') || 'Report Type' }}</label>
              <Select
                v-model="reportType"
                :options="[
                  { label: t('sportAdminReports.types.overview') || 'Overview', value: 'overview' },
                  { label: t('sportAdminReports.types.matches') || 'Matches', value: 'matches' },
                  { label: t('sportAdminReports.types.standings') || 'Standings', value: 'standings' },
                  { label: t('sportAdminReports.types.players') || 'Players', value: 'players' },
                  { label: t('sportAdminReports.types.attendance') || 'Attendance', value: 'attendance' },
                ]"
                option-label="label"
                option-value="value"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Generate Button -->
          <div class="filter-actions">
            <Button
              :label="t('sportAdminReports.actions.generate') || 'Generate Report'"
              :disabled="!canGenerate || loading"
              :loading="loading"
              @click="generateReport"
            />
            <Button
              v-if="reportGenerated"
              outlined
              :label="t('sportAdminReports.actions.clearFilters') || 'Clear Filters'"
              @click="() => {
                reportGenerated = false
                selectedDivision = null
                selectedTeam = null
                selectedTournament = null
              }"
            />
          </div>
        </template>
      </Card>

      <!-- Report Display -->
      <div v-if="reportGenerated" class="sport-admin-reports__report">
        <!-- Report Content (for PDF export) -->
        <div class="sport-admin-reports__report-content">
          <!-- Report Header -->
          <div class="report-header">
          <h2>{{ reportTitle }}</h2>
          <div class="report-meta">
            <span v-if="dateFrom">{{ t('sportAdminReports.report.from') || 'From' }}: {{ dateFrom.toLocaleDateString() }}</span>
            <span v-if="dateTo">{{ t('sportAdminReports.report.to') || 'To' }}: {{ dateTo.toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="statistics-grid">
          <div class="stat-card">
            <div class="stat-label">{{ t('sportAdminReports.stats.totalMatches') || 'Total Matches' }}</div>
            <div class="stat-value">{{ statisticsData.totalMatches || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('sportAdminReports.stats.completedMatches') || 'Completed' }}</div>
            <div class="stat-value">{{ statisticsData.completedMatches || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('sportAdminReports.stats.totalTeams') || 'Total Teams' }}</div>
            <div class="stat-value">{{ statisticsData.totalTeams || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('sportAdminReports.stats.totalPlayers') || 'Total Players' }}</div>
            <div class="stat-value">{{ statisticsData.totalPlayers || 0 }}</div>
          </div>
        </div>

        <!-- Report Tabs -->
        <TabView>
          <!-- Matches Tab -->
          <TabPanel :header="t('sportAdminReports.tabs.matches') || 'Matches'">
            <DataTable v-if="matchesData && matchesData.length > 0" :value="matchesData" striped-rows>
              <Column field="date" :header="t('sportAdminReports.table.date') || 'Date'" />
              <Column field="tournamentName" :header="t('sportAdminReports.table.tournament') || 'Tournament'" />
              <Column field="divisionName" :header="t('sportAdminReports.table.division') || 'Division'" />
              <Column field="homeTeamName" :header="t('sportAdminReports.table.homeTeam') || 'Home Team'" />
              <Column field="awayTeamName" :header="t('sportAdminReports.table.awayTeam') || 'Away Team'" />
              <Column field="score" :header="t('sportAdminReports.table.score') || 'Score'" />
              <Column field="venue" :header="t('sportAdminReports.table.venue') || 'Venue'" />
              <Column field="status" :header="t('sportAdminReports.table.status') || 'Status'" />
            </DataTable>
            <p v-else>{{ t('sportAdminReports.noData') || 'No matches data available' }}</p>
          </TabPanel>

          <!-- Standings Tab -->
          <TabPanel :header="t('sportAdminReports.tabs.standings') || 'Standings'">
            <DataTable v-if="standingsData && standingsData.length > 0" :value="standingsData" striped-rows>
              <Column field="rankPosition" :header="t('sportAdminReports.table.position') || 'Position'" />
              <Column field="teamName" :header="t('sportAdminReports.table.team') || 'Team'" />
              <Column field="tournamentName" :header="t('sportAdminReports.table.tournament') || 'Tournament'" />
              <Column field="played" :header="t('sportAdminReports.table.played') || 'Played'" />
              <Column field="wins" :header="t('sportAdminReports.table.wins') || 'Won'" />
              <Column field="draws" :header="t('sportAdminReports.table.draws') || 'Draw'" />
              <Column field="losses" :header="t('sportAdminReports.table.losses') || 'Lost'" />
              <Column field="goalsFor" :header="t('sportAdminReports.table.goalsFor') || 'Goals For'" />
              <Column field="goalsAgainst" :header="t('sportAdminReports.table.goalsAgainst') || 'Goals Against'" />
              <Column field="goalDifference" :header="t('sportAdminReports.table.goalDifference') || 'Goal Difference'" />
              <Column field="points" :header="t('sportAdminReports.table.points') || 'Points'" />
            </DataTable>
            <p v-else>{{ t('sportAdminReports.noData') || 'No standings data available' }}</p>
          </TabPanel>

          <!-- Players Tab -->
          <TabPanel :header="t('sportAdminReports.tabs.players') || 'Players'">
            <DataTable v-if="playersData.length > 0" :value="playersData" class="p-datatable-sm">
              <Column field="rankPosition" :header="t('sportAdminReports.table.position') || 'Rank'" />
              <Column field="playerName" :header="t('sportAdminReports.table.player') || 'Player'" />
              <Column field="teamName" :header="t('sportAdminReports.table.team') || 'Team'" />
              <Column field="playingPosition" :header="t('sportAdminReports.table.position') || 'Position'" />
              <Column field="appearances" :header="t('sportAdminReports.table.appearances') || 'Appearances'" />
              <Column field="goals" :header="t('sportAdminReports.table.goals') || 'Goals'" />
              <Column field="assists" :header="t('sportAdminReports.table.assists') || 'Assists'" />
              <Column field="yellowCards" :header="t('sportAdminReports.table.yellowCards') || 'Yellow Cards'" />
              <Column field="redCards" :header="t('sportAdminReports.table.redCards') || 'Red Cards'" />
              <Column field="penaltyGoals" :header="t('sportAdminReports.table.penaltyGoals') || 'Penalty Goals'" />
              <Column field="ownGoals" :header="t('sportAdminReports.table.ownGoals') || 'Own Goals'" />
              <Column field="disciplinePoints" :header="t('sportAdminReports.table.disciplinePoints') || 'Discipline Points'" />
            </DataTable>
            <p v-else>{{ t('sportAdminReports.noData') || 'No player statistics data available' }}</p>
          </TabPanel>

          <!-- Attendance Tab -->
          <TabPanel :header="t('sportAdminReports.tabs.attendance') || 'Attendance'">
            <p>{{ t('sportAdminReports.noData') || 'Attendance data will appear here' }}</p>
          </TabPanel>
        </TabView>
        </div>

        <!-- Isolated printable document used only by the PDF exporter. -->
        <div class="sport-admin-reports__pdf-export" aria-hidden="true">
          <header class="pdf-report-header">
            <div class="pdf-report-brand">
              <img :src="logoUrl" alt="HFCCF" class="pdf-report-logo" />
              <div>
                <div class="pdf-report-organization">អង្គការសម្រាប់ក្តីសង្ឃឹមរបស់កុមារ</div>
                <div class="pdf-report-organization-en">Sport Management System</div>
              </div>
            </div>
            <div class="pdf-report-heading">
              <h1>{{ reportTitle }}</h1>
              <p>Sport Management System</p>
            </div>
            <div class="pdf-report-meta">
              <div><strong>Division</strong> {{ selectedOptionLabel(divisions, selectedDivision) }}</div>
              <div><strong>Team</strong> {{ selectedOptionLabel(teams, selectedTeam) }}</div>
              <div><strong>Tournament</strong> {{ selectedOptionLabel(tournaments, selectedTournament) }}</div>
              <div><strong>Period</strong> {{ formatReportDate(dateFrom) }} – {{ formatReportDate(dateTo) }}</div>
              <div><strong>Generated</strong> {{ formatReportDate(new Date()) }}</div>
            </div>
          </header>

          <section class="pdf-report-section pdf-summary-section">
            <h2>Summary</h2>
            <table class="pdf-statistics-table">
              <tbody>
                <tr>
                  <th>Total Matches</th>
                  <th>Completed Matches</th>
                  <th>Total Teams</th>
                  <th>Total Players</th>
                </tr>
                <tr>
                  <td>{{ statisticsData.totalMatches || 0 }}</td>
                  <td>{{ statisticsData.completedMatches || 0 }}</td>
                  <td>{{ statisticsData.totalTeams || 0 }}</td>
                  <td>{{ statisticsData.totalPlayers || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'overview' || reportType === 'matches'" class="pdf-report-section">
            <h2>Match Summary</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th class="pdf-number-column">No.</th>
                  <th>Date</th>
                  <th>Tournament</th>
                  <th>Home Team</th>
                  <th>Away Team</th>
                  <th class="pdf-score-column">Score</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(match, index) in filteredMatches" :key="`pdf-match-${match.id}`">
                  <td class="pdf-number-column">{{ index + 1 }}</td>
                  <td>{{ match.date || 'N/A' }}</td>
                  <td>{{ match.tournamentName || match.tournament || selectedOptionLabel(tournaments, match.tournamentId) }}</td>
                  <td>{{ match.homeTeam || 'N/A' }}</td>
                  <td>{{ match.awayTeam || 'N/A' }}</td>
                  <td class="pdf-score-column">{{ formatMatchScore(match) }}</td>
                  <td>{{ match.venue || 'N/A' }}</td>
                  <td>{{ match.status || 'N/A' }}</td>
                </tr>
                <tr v-if="filteredMatches.length === 0">
                  <td colspan="8" class="pdf-empty-state">No match data available for this period.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'overview'" class="pdf-report-section">
            <h2>Team Summary</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total teams</td>
                  <td>{{ statisticsData.totalTeams || 0 }}</td>
                </tr>
                <tr>
                  <td>Upcoming matches</td>
                  <td>{{ statisticsData.upcomingMatches || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'overview'" class="pdf-report-section">
            <h2>Player Summary</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total players</td>
                  <td>{{ statisticsData.totalPlayers || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'overview'" class="pdf-report-section">
            <h2>Attendance Summary</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Average attendance</td>
                  <td>{{ statisticsData.averageAttendance || 0 }}%</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'standings'" class="pdf-report-section">
            <h2>Standings</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Team</th>
                  <th>Played</th>
                  <th>Won</th>
                  <th>Draw</th>
                  <th>Lost</th>
                  <th>Goals For</th>
                  <th>Goals Against</th>
                  <th>Goal Difference</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(standing, index) in standingsData" :key="`pdf-standing-${index}`">
                  <td>{{ standing.rankPosition }}</td>
                  <td>{{ standing.teamName }}</td>
                  <td>{{ standing.played }}</td>
                  <td>{{ standing.wins }}</td>
                  <td>{{ standing.draws }}</td>
                  <td>{{ standing.losses }}</td>
                  <td>{{ standing.goalsFor }}</td>
                  <td>{{ standing.goalsAgainst }}</td>
                  <td>{{ standing.goalDifference }}</td>
                  <td>{{ standing.points }}</td>
                </tr>
                <tr v-if="standingsData.length === 0">
                  <td colspan="10" class="pdf-empty-state">No standings data available for this report.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'players'" class="pdf-report-section">
            <h2>Player Statistics</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Apps</th>
                  <th>G</th>
                  <th>A</th>
                  <th>YC</th>
                  <th>RC</th>
                  <th>PG</th>
                  <th>OG</th>
                  <th>DP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="playersData.length === 0">
                  <td colspan="11" class="pdf-empty-state">No player statistics data available for this report.</td>
                </tr>
                <tr v-for="player in playersData" :key="`${player.playerId}-${player.teamId}`">
                  <td>{{ player.rankPosition }}</td>
                  <td>{{ player.playerName }}</td>
                  <td>{{ player.teamName }}</td>
                  <td>{{ player.appearances }}</td>
                  <td>{{ player.goals }}</td>
                  <td>{{ player.assists }}</td>
                  <td>{{ player.yellowCards }}</td>
                  <td>{{ player.redCards }}</td>
                  <td>{{ player.penaltyGoals }}</td>
                  <td>{{ player.ownGoals }}</td>
                  <td>{{ player.disciplinePoints }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-if="reportType === 'attendance'" class="pdf-report-section">
            <h2>Attendance Summary</h2>
            <table class="pdf-report-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Attendance Records</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" class="pdf-empty-state">No attendance data available for this report.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer class="pdf-report-footer">
            <span>Prepared by: HFCCF Sport Administration</span>
            <span>Reviewed by: ____________________</span>
            <span>Generated: {{ formatReportDate(new Date()) }}</span>
          </footer>
        </div>

        <!-- Export Actions -->
        <div class="export-actions">
          <Button
            outlined
            icon="pi pi-file-pdf"
            :label="t('sportAdminReports.export.pdf') || 'Export as PDF'"
            :loading="exportLoading"
            @click="exportReport('pdf')"
          />
          <Button
            outlined
            icon="pi pi-file"
            :label="t('sportAdminReports.export.excel') || 'Export as Excel'"
            :loading="exportLoading"
            @click="exportReport('excel')"
          />
          <Button
            outlined
            icon="pi pi-print"
            :label="t('sportAdminReports.export.print') || 'Print Report'"
            @click="exportReport('print')"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>{{ t('sportAdminReports.emptyState') || 'Select filters and generate a report to view data' }}</p>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-admin-reports {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
}

.sport-admin-reports__filters {
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-message {
  padding: 1rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.sport-admin-reports__report {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
}

.report-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
}

.report-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.export-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
  color: #64748b;
}

:deep(.p-card) {
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

:deep(.p-tabview) {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5ecf2;
}

:deep(.p-datatable) {
  border: none;
  background: transparent;
}

@page {
  size: A4 portrait;
  margin: 10mm;
}

.sport-admin-reports__pdf-export {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
  width: 190mm;
  box-sizing: border-box;
  padding: 0;
  background: #ffffff;
  color: #111827;
  font-family: Arial, "Noto Sans Khmer", sans-serif;
  font-size: 10px;
  line-height: 1.35;
}

.pdf-report-header {
  display: grid;
  grid-template-columns: 1fr 1.25fr 1fr;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid #1e3a5f;
}

.pdf-report-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pdf-report-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.pdf-report-organization {
  font-size: 10px;
  font-weight: 700;
  color: #1e3a5f;
}

.pdf-report-organization-en {
  margin-top: 2px;
  font-size: 9px;
  color: #475569;
}

.pdf-report-heading {
  text-align: center;
}

.pdf-report-heading h1 {
  margin: 0;
  color: #1e3a5f;
  font-size: 17px;
  font-weight: 700;
}

.pdf-report-heading p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 10px;
}

.pdf-report-meta {
  text-align: right;
  color: #475569;
  font-size: 9px;
}

.pdf-report-meta div + div {
  margin-top: 3px;
}

.pdf-report-section {
  margin-top: 12px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-report-section h2 {
  margin: 0 0 5px;
  padding: 4px 7px;
  border-left: 3px solid #1e3a5f;
  color: #1e3a5f;
  font-size: 12px;
  font-weight: 700;
}

.pdf-report-table,
.pdf-statistics-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.pdf-report-table th,
.pdf-report-table td,
.pdf-statistics-table th,
.pdf-statistics-table td {
  border: 1px solid #64748b;
  padding: 5px 6px;
  vertical-align: middle;
  overflow-wrap: anywhere;
}

.pdf-report-table th,
.pdf-statistics-table th {
  background: #e8eef5;
  color: #1e293b;
  font-size: 9px;
  font-weight: 700;
  text-align: left;
}

.pdf-report-table td {
  color: #1f2937;
  font-size: 9px;
}

.pdf-statistics-table {
  table-layout: fixed;
}

.pdf-statistics-table th,
.pdf-statistics-table td {
  width: 25%;
  text-align: center;
}

.pdf-statistics-table td {
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 700;
}

.pdf-number-column {
  width: 8%;
  text-align: center !important;
}

.pdf-score-column {
  width: 12%;
  text-align: center !important;
}

.pdf-empty-state {
  color: #64748b;
  text-align: center;
  font-style: italic;
}

.pdf-section-empty {
  padding: 8px;
  border: 1px solid #94a3b8;
  font-size: 9px;
}

.pdf-report-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 7px;
  border-top: 1px solid #94a3b8;
  color: #64748b;
  font-size: 8px;
  break-inside: avoid;
  page-break-inside: avoid;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .report-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .report-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .export-actions {
    flex-direction: column;
  }

  :deep(.p-button) {
    width: 100%;
  }
}
</style>
