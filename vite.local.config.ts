import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A self-contained browser build: the local game has no hosted-service bindings.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "dist-local",
    emptyOutDir: true,
  },
});
