import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";

// Both builds are static. Hostinger gets its own base and output directory so
// preparing an upload cannot replace the local launcher's browser bundle.
export default defineConfig(({ mode }) => {
  const hostinger = mode === "hostinger";
  return {
    base: hostinger ? "/krillion/" : "./",
    plugins: [
      react(),
      {
        name: "krillion-dictionary-assets",
        apply: "build",
        async generateBundle() {
          for (const [filename, source] of [
            ["words.json", "word-evidence.json"],
            ["SCOWL-LICENSE.txt", "SCOWL-LICENSE.txt"],
          ]) {
            this.emitFile({
              type: "asset",
              fileName: `dictionary/${filename}`,
              source: await readFile(
                new URL(`./server/dictionary/${source}`, import.meta.url),
              ),
            });
          }
        },
      },
    ],
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
