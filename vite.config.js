import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://scms-server-multitenacy.onrender.com/api/v1'),
      'import.meta.env.VITE_SERVER_URL': JSON.stringify(env.VITE_SERVER_URL || 'https://scms-server-multitenacy.onrender.com'),
    }
  };
})
