import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },

  esbuild: {
    treeShaking: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,

    rollupOptions: {
      external: [/(?!react-modal-global)react.*/],
      treeshake: true
    },
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      formats: ["es"],
      fileName: "index"
    },
    sourcemap: true
  }
})
