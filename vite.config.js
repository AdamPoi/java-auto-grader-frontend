import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
     
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@tabler/icons-react":
        "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
  },
});
