import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HSMS",
    short_name: "HSMS",
    description: "Housing Society Management System",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/hsms.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/hsms.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/hsms.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
