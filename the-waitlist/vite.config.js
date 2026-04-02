import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/thewaitlist/',
  build: {
    // Tells Vite to output the files one folder up, into "thewaitlist"
    outDir: '../thewaitlist', 
    
    // Tells Vite to safely clear the old files out of that folder before putting the new ones in
    emptyOutDir: true 
  }
})

