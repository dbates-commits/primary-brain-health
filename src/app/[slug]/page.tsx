import { notFound } from "next/navigation";
import { client } from "@tina/__generated__/client";
import { PageClient } from "@/components/PageClient";
import { Noto_Serif } from "next/font/google";

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

  try {
    const result = await client.queries.page({ relativePath });

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
  } catch (error) {
    console.error("Error fetching page:", error);
    notFound();
  }
}
