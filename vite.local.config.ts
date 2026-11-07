import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Both builds are static. Hostinger gets its own base and output directory so
// preparing an upload cannot replace the local launcher's browser bundle.
export default defineConfig(({ mode }) => {
  const hostinger = mode === "hostinger";
  return {
    base: hostinger ? "/krillion/" : "./",
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
      outDir: hostinger ? "dist-hostinger" : "dist-local",
      emptyOutDir: true,
    },
  };
});
