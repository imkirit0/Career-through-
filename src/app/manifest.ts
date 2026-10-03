import type { MetadataRoute } from "next";

// Lets the site be added to a phone's home screen with the Career Through icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Career Through",
    short_name: "Career Through",
    description: "Choose the role. Prove you're ready. Get access to opportunities.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8f7ff",
    theme_color: "#4f46e5",
    icons: [
      { src: "/brand/png/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/png/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/png/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
