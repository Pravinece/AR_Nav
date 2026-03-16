import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_APP_URL,
    server: {
      host: "0.0.0.0",
      port: 8001,
      strictPort: true,
      allowedHosts: [
        ".ngrok-free.dev"
      ]
    }
  }
})

// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')

//   return {
//     plugins: [react(), basicSsl()],
//     base: env.VITE_APP_URL,
    // server: {
    //   host: "0.0.0.0",
    //   port: 8000,
    //   https: true
    // }
  // }
// })