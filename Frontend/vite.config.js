import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Expose to your network
    port: 5173, // Default port (optional)
    open: true, // Automatically open in the browser (optional)
  },
});
