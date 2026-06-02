import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const apiEnv = process.env.VITE_API_ENV || 'production';
  const proxyTarget = apiEnv === 'staging'
    ? 'https://skillgo.africa/staging'
    : apiEnv === 'local'
      ? 'http://localhost:5012'
      : 'https://skillgo.africa/v1';

  return {
    plugins: [react()],
    server: {
      host: "::",
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "recharts", "lodash", "prop-types", "eventemitter3"],
      force: true,
    },
    define: {
      "process.env": {},
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/],
      },
    },
  };
});
