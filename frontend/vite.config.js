import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Single source of truth for the Razorpay key: payment-service/.env.
  // Only the publishable key id (RAZORPAY_KEY_ID) is exposed to the browser.
  // The secret (RAZORPAY_KEY_SECRET) is deliberately NOT forwarded to the client.
  const paymentEnv = loadEnv(mode, path.resolve(process.cwd(), '../payment-service'), 'RAZORPAY_');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(paymentEnv.RAZORPAY_KEY_ID || ''),
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});
