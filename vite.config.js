import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: [
        "app-icon.svg",
        "icons/icon.svg",
        "icons/maskable-icon.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-icon-192.png",
        "icons/maskable-icon-512.png",
      ],
      manifest: {
        id: "/",
        name: "Collective Dream Observatory",
        short_name: "Dream Observatory",
        description:
          "A privacy-first dream journal, public dream archive, and collective dream research platform.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#030407",
        theme_color: "#071014",
        categories: ["productivity", "education", "lifestyle"],
        lang: "en",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Record Dream",
            short_name: "Record",
            description: "Open the fast dream recorder.",
            url: "/record",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Import Diary",
            short_name: "Import",
            description: "Import a structured dream diary.",
            url: "/import",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Explore Dreams",
            short_name: "Explore",
            description: "Read the public dream archive.",
            url: "/explore",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "My Dream Map",
            short_name: "Dream Map",
            description: "Open your private dream dashboard.",
            url: "/dashboard",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Collective Patterns",
            short_name: "Patterns",
            description: "Open aggregate dream patterns.",
            url: "/patterns",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/__/,
          /^\/api\//,
          /^\/firebase\//,
          /^\/supabase\//,
          /\/exports?\//,
          /\/diary-imports?\//,
        ],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              request.method === "GET" &&
              (url.pathname.startsWith("/icons/") ||
                url.pathname === "/app-icon.svg" ||
                url.pathname.startsWith("/assets/")),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdo-public-static-assets",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
});
