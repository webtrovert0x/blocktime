import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load .env explicitly
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const reownId = process.env.REOWN_ID || env.REOWN_ID || '';

  return {
    plugins: [react()],
    define: {
      'process.env.REOWN_ID': JSON.stringify(reownId),
    },
    server: {
      port: 5173,
    },
  };
});

