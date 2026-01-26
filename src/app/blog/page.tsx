import { Container } from "@/components/shared/Container";
import { Card, CardTitle, CardDescription } from "@/components/shared/Card";
import Link from "next/link";
import Image from "next/image";

// Sample blog posts (in a real app, this would come from Tina)
const posts = [
  {
    slug: "getting-started-with-tina",
    title: "Getting Started with Tina CMS",
    excerpt: "Learn how to set up Tina CMS with Next.js and create your first editable content.",
    author: "Sarah Chen",
    date: "2024-01-15",
    category: "Tutorial",
    featuredImage: "https://placehold.co/800x400/6366f1/ffffff?text=Getting+Started",
  },
  {
    slug: "block-based-editing",
    title: "Building Block-Based Pages",
    excerpt: "Discover how to create flexible, reusable blocks that content editors will love.",
    author: "Mike Johnson",
    date: "2024-01-10",
    category: "Tutorial",
    featuredImage: "https://placehold.co/800x400/8b5cf6/ffffff?text=Block+Editing",
  },
  {
    slug: "visual-editing-tips",
    title: "Tips for Better Visual Editing",
    excerpt: "Make the most of Tina's visual editing capabilities with these pro tips.",
    author: "Lisa Park",
    date: "2024-01-05",
    category: "Tips",
    featuredImage: "https://placehold.co/800x400/6366f1/ffffff?text=Visual+Editing",
  },
  {
    slug: "content-modeling-best-practices",
    title: "Content Modeling Best Practices",
    excerpt: "Learn how to structure your content for maximum flexibility and reusability.",
    author: "Alex Thompson",
    date: "2024-01-01",
    category: "Best Practices",
    featuredImage: "https://placehold.co/800x400/8b5cf6/ffffff?text=Content+Modeling",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <Container>
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Insights, tutorials, and best practices for building with Tina CMS
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card variant="bordered" padding="none" hover className="overflow-hidden h-full">
                  <div className="relative aspect-video">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <CardTitle className="mb-2">{post.title}</CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                    <div className="mt-4 text-sm text-gray-500">
                      By {post.author}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
