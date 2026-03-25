import { client } from "@tina/__generated__/client";
import { PageClient } from "@/components/PageClient";

export default async function Home() {
  try {
    const result = await client.queries.page({ relativePath: "home.mdx" });

    return (
      <PageClient
        data={result.data}
        query={result.query}
        variables={result.variables}
      />
    );
  } catch (error) {
    console.error("Error fetching home page:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Primary Brain Health</h1>
          <p className="text-gray-600 mb-4">
            Create your home page content in the Tina admin.
          </p>
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
}
