import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // langsung buka hasil analisis di browser
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});