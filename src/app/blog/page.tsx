import { Container } from "@/components/shared/Container";
import { Card, CardTitle, CardDescription } from "@/components/shared/Card";
import Link from "next/link";
import Image from "next/image";

// Sample blog posts (in a real app, this would come from Tina)
const posts = [
  {
    slug: "getting-started-with-tina",
    title: "Why Early Brain Health Screening Matters",
    excerpt: "Research shows that early intervention is one of the most powerful tools for reducing dementia risk. Here's what you should know.",
    author: "Dr. David Bates",
    date: "2024-01-15",
    category: "Prevention",
    featuredImage: "https://placehold.co/800x400/6366f1/ffffff?text=Brain+Health",
  },
  {
    slug: "block-based-editing",
    title: "5 Lifestyle Changes That Protect Your Brain",
    excerpt: "Evidence-based lifestyle modifications that can reduce your risk of cognitive decline and support long-term brain health.",
    author: "Dr. Sarah Mitchell",
    date: "2024-01-10",
    category: "Lifestyle",
    featuredImage: "https://placehold.co/800x400/8b5cf6/ffffff?text=Lifestyle",
  },
  {
    slug: "visual-editing-tips",
    title: "Understanding Cognitive Risk Factors",
    excerpt: "From genetics to cardiovascular health, learn which factors influence your brain health and what you can do about them.",
    author: "Dr. David Bates",
    date: "2024-01-05",
    category: "Education",
    featuredImage: "https://placehold.co/800x400/6366f1/ffffff?text=Risk+Factors",
  },
  {
    slug: "content-modeling-best-practices",
    title: "Understanding Your Cognitive Assessment Results",
    excerpt: "A guide to interpreting your brain health assessment and what the results mean for your personalized prevention plan.",
    author: "Dr. Sarah Mitchell",
    date: "2024-01-01",
    category: "Assessment",
    featuredImage: "https://placehold.co/800x400/8b5cf6/ffffff?text=Assessment",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <Container>
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Research-backed insights, prevention strategies, and brain health education
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
