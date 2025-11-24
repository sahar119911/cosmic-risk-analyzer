import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define Cesium base URL for runtime
    CESIUM_BASE_URL: JSON.stringify("/"),
  },
  build: {
    // Increase chunk size warning limit for Cesium
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    // Exclude Cesium from pre-bundling to avoid issues
    exclude: ["cesium"],
  },
}));
