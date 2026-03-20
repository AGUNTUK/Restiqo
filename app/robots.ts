import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: "https://restiqa-market.vercel.app/sitemap.xml",
  };
}
