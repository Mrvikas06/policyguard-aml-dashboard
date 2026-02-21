import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/policyguard-aml-dashboard/',
  plugins: [react()],
})