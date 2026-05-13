import type { MetadataRoute } from "next";
import { client } from "@tina/__generated__/client";

const BASE_URL = "https://primarybrainhealth.com";

const EXCLUDED_SLUGS = new Set(["home", "home-2", "test"]);

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  let tinaEntries: MetadataRoute.Sitemap = [];
  try {
    const pages = await client.queries.pageConnection();
    tinaEntries =
      pages.data?.pageConnection?.edges
        ?.map((edge) => edge?.node?._sys.filename)
        .filter((filename): filename is string => !!filename)
        .filter((filename) => !EXCLUDED_SLUGS.has(filename))
        .map((filename) => ({
          url: `${BASE_URL}/${filename}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        })) ?? [];
  } catch (error) {
    console.error("Sitemap: failed to fetch Tina pages", error);
  }

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...tinaEntries,
    ...STATIC_ROUTES.map((entry) => ({ ...entry, lastModified })),
  ];
}
