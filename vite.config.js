import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import {
  createSecurityHeaders,
  getApiBaseOrigin,
  getImagePublicOrigin,
} from './src/utils/securityHeaders.js'

function createManualChunks(id) {
  if (!id.includes('node_modules')) return undefined

  // Keep the largest UI/runtime dependencies in predictable buckets so the
  // main application chunk does not absorb every vendor package.
  if (id.includes('/@primeuix/styles/')) {
    return 'vendor-primevue-styles'
  }

  if (
    id.includes('/primevue/datatable/') ||
    id.includes('/primevue/column/') ||
    id.includes('/primevue/paginator/')
  ) {
    return 'vendor-primevue-table'
  }

  if (
    id.includes('/primevue/inputtext/') ||
    id.includes('/primevue/inputnumber/') ||
    id.includes('/primevue/textarea/') ||
    id.includes('/primevue/select/') ||
    id.includes('/primevue/selectbutton/') ||
    id.includes('/primevue/password/') ||
    id.includes('/primevue/checkbox/') ||
    id.includes('/primevue/calendar/') ||
    id.includes('/primevue/inputswitch/') ||
    id.includes('/primevue/togglebutton/') ||
    id.includes('/primevue/autocomplete/') ||
    id.includes('/primevue/multiselect/') ||
    id.includes('/primevue/iconfield/') ||
    id.includes('/primevue/inputicon/')
  ) {
    return 'vendor-primevue-forms'
  }

  if (
    id.includes('/primevue/dialog/') ||
    id.includes('/primevue/drawer/') ||
    id.includes('/primevue/popover/') ||
    id.includes('/primevue/menu/') ||
    id.includes('/primevue/blockui/') ||
    id.includes('/primevue/scrollpanel/')
  ) {
    return 'vendor-primevue-overlays'
  }

  if (
    id.includes('/primevue/card/') ||
    id.includes('/primevue/tag/') ||
    id.includes('/primevue/badge/') ||
    id.includes('/primevue/avatar/') ||
    id.includes('/primevue/progressspinner/') ||
    id.includes('/primevue/divider/')
  ) {
    return 'vendor-primevue-display'
  }

  if (id.includes('/@primevue/icons/')) {
    return 'vendor-primevue-icons'
  }

  if (
    id.includes('/@primevue/core/') ||
    id.includes('/@primeuix/utils/') ||
    id.includes('/@primeuix/styled/')
  ) {
    return 'vendor-primevue-runtime'
  }

  if (
    id.includes('/vue/') ||
    id.includes('/vue-router/') ||
    id.includes('/vue-i18n/') ||
    id.includes('/pinia/')
  ) {
    return 'vendor-core'
  }

  return 'vendor-other'
}

function securityHeadersPlugin() {
  return {
    name: 'security-headers',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            name: 'referrer',
            content: 'strict-origin-when-cross-origin',
          },
          injectTo: 'head',
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(command === 'serve' ? 'development' : 'production', projectRoot, '')
  const apiBaseOrigin = getApiBaseOrigin(env)
  const imagePublicOrigin = getImagePublicOrigin(env)
  const securityHeaders = createSecurityHeaders({ isDev, apiBaseOrigin, imagePublicOrigin })

  return {
    plugins: [vue(), tailwindcss(), securityHeadersPlugin()],
    server: {
      headers: securityHeaders,
      proxy: {
        // Keep local API requests same-origin in the browser; Vite forwards them to the Laravel backend.
        '/api': {
          target: 'http://hfccf-backend.test',
          changeOrigin: true,
          secure: false,
        },
        // Proxy public image assets through Vite in dev so canvas exports can fetch them same-origin.
        ...(imagePublicOrigin
          ? {
              '/__image-proxy': {
                target: imagePublicOrigin,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/__image-proxy/, ''),
              },
            }
          : {}),
      },
    },
    preview: {
      headers: createSecurityHeaders({
        isDev: false,
        apiBaseOrigin,
        imagePublicOrigin,
      }),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: createManualChunks,
        },
      },
    },
  }
})
