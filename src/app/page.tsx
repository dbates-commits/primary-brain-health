import type { Metadata } from "next";
import { client } from "@tina/__generated__/client";
import { PageClient } from "@/components/PageClient";

const FALLBACK_OG_IMAGE = "/images/og-image.jpg";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const result = await client.queries.page({ relativePath: "home.mdx" });
    const page = result?.data?.page;
    const title = page?.title || undefined;
    const description = page?.description || undefined;
    const ogImage = page?.socialImage || FALLBACK_OG_IMAGE;

    return {
      // Use `absolute` so the layout's "%s | Primary Brain Health" template
      // doesn't tack the brand on twice for the homepage.
      ...(title && { title: { absolute: title } }),
      ...(description && { description }),
      alternates: { canonical: "/" },
      openGraph: {
        type: "website",
        url: "/",
        siteName: "Primary Brain Health",
        ...(title && { title }),
        ...(description && { description }),
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title || "Primary Brain Health",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        ...(title && { title }),
        ...(description && { description }),
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function Home() {
  let result: Awaited<ReturnType<typeof client.queries.page>> | null = null;
  try {
    result = await client.queries.page({ relativePath: "home.mdx" });
  } catch (error) {
    console.error("Error fetching home page:", error);
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Primary Brain Health</h1>
          <p className="text-gray-600 mb-4">
            Create your home page content in the Tina admin.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/admin/index.html"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Open Tina Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <PageClient
      data={result.data}
      query={result.query}
      variables={result.variables}
    />
  );
}
