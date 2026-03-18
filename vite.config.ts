import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/vue/") ||
            id.includes("/@vue/") ||
            id.includes("/pinia/") ||
            id.includes("/vue-router/") ||
            id.includes("/@vueuse/")
          ) {
            return "framework";
          }

          if (
            id.includes("/naive-ui/") ||
            id.includes("/@css-render/") ||
            id.includes("/css-render/") ||
            id.includes("/seemly/") ||
            id.includes("/vooks/") ||
            id.includes("/vueuc/")
          ) {
            return "naive-ui";
          }

          if (id.includes("/@vicons/")) {
            return "icons";
          }

          if (id.includes("/echarts/") || id.includes("/zrender/")) {
            return "charts";
          }

          if (id.includes("/@pdftron/")) {
            return "pdftron";
          }

          if (id.includes("/pusher-js/")) {
            return "realtime";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
