import { notFound } from "next/navigation";
import { client } from "@tina/__generated__/client";
import { PageClient } from "@/components/PageClient";

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
