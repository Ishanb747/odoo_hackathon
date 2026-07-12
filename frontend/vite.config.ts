import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load .env so we can read vars at config time (before the app bundle runs)
  const env = loadEnv(mode, process.cwd(), '')

  const backendPort = parseInt(env.VITE_BACKEND_PORT ?? '8000', 10)
  const frontendPort = parseInt(env.VITE_PORT ?? '5173', 10)
  const apiBase = env.VITE_API_URL ?? `http://localhost:${backendPort}`

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: frontendPort,
      proxy: {
        // Any request to /api/* is forwarded to the FastAPI backend,
        // stripping the /api prefix before forwarding.
        // This lets you also call the backend directly via VITE_API_URL.
        '/api': {
          target: apiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
