import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@tina/__generated__/client";
import { PageClient } from "@/components/PageClient";
import { Noto_Serif } from "next/font/google";

const FALLBACK_OG_IMAGE = "/images/og-image.jpg";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-noto-serif",
});

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const result = await client.queries.page({
      relativePath: `${slug}.mdx`,
    });
    const page = result?.data?.page;
    const title = page?.title || undefined;
    const description = page?.description || undefined;
    const ogImage = page?.socialImage || FALLBACK_OG_IMAGE;

    const canonicalPath = `/${slug}`;

    return {
      ...(title && { title }),
      ...(description && { description }),
      alternates: { canonical: canonicalPath },
      openGraph: {
        type: "website",
        url: canonicalPath,
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

export async function generateStaticParams() {
  try {
    const pages = await client.queries.pageConnection();
    return (
      pages.data?.pageConnection?.edges
        ?.filter((edge) => edge?.node?._sys.filename !== "home")
        ?.map((edge) => ({
          slug: edge?.node?._sys.filename,
        })) || []
    );
  } catch {
    return [];
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const relativePath = `${resolvedParams.slug}.mdx`;

  let result: Awaited<ReturnType<typeof client.queries.page>>;
  try {
    result = await client.queries.page({ relativePath });
  } catch (error) {
    console.error("Error fetching page:", error);
    notFound();
  }

  if (resolvedParams.slug === "home-2") {
    return (
      <div className={`${notoSerif.variable} [&_h1]:font-[family-name:var(--font-noto-serif)] [&_h2]:font-[family-name:var(--font-noto-serif)] [&_h3]:font-[family-name:var(--font-noto-serif)] [&_p]:font-[family-name:var(--font-noto-serif)] [&_h1]:font-light [&_h2]:font-light [&_h3]:font-light`}>
        <PageClient
          data={result.data}
          query={result.query}
          variables={result.variables}
        />
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
