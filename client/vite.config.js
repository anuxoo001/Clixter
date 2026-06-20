import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL

  return defineConfig({
    plugins: [react()],
    server: target
      ? {
          proxy: {
            '/api': {
              target,
              changeOrigin: true,
              secure: false,
            },
            '/socket.io': {
              target,
              ws: true,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  })
}
