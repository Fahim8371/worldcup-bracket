import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The football-data.org API blocks direct browser requests (CORS) and we don't
// want the API key in the client bundle. So we proxy /api/fd/* through the dev
// server and inject the X-Auth-Token header here, server-side, from .env.
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const token = env.FOOTBALL_DATA_TOKEN || ''

  return {
    // On GitHub Pages the app is served from /worldcup-bracket/. Locally it's '/'.
    base: command === 'build' ? '/worldcup-bracket/' : '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api/fd': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fd/, ''),
          headers: {
            'X-Auth-Token': token,
          },
        },
      },
    },
  }
})
