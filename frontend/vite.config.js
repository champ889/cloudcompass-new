import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [tailwindcss(), react()],
  };

  if (mode === "development") {
    config.server = {
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
        },
        "/icons": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
        },
      },
    };
  }

  return config;
});
