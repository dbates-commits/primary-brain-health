import { notFound } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import Image from "next/image";
import Link from "next/link";

// Sample blog posts (in a real app, this would come from Tina)
const posts: Record<string, {
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  category: string;
  featuredImage: string;
  content: string;
}> = {
  "getting-started-with-tina": {
    title: "Getting Started with Tina CMS",
    excerpt: "Learn how to set up Tina CMS with Next.js and create your first editable content.",
    author: "Sarah Chen",
    authorRole: "CTO",
    authorAvatar: "https://placehold.co/100x100/8b5cf6/ffffff?text=SC",
    date: "January 15, 2024",
    category: "Tutorial",
    featuredImage: "https://placehold.co/1200x600/6366f1/ffffff?text=Getting+Started+with+Tina",
    content: `
# Getting Started with Tina CMS

Tina CMS is a Git-backed headless content management system that enables developers and content creators to collaborate seamlessly. In this tutorial, we'll walk through setting up Tina with a Next.js project.

## Prerequisites

Before we begin, make sure you have:
- Node.js 18 or later
- A GitHub account
- Basic knowledge of React and Next.js

## Installation

The easiest way to get started is by using the create-tina-app CLI:

\`\`\`bash
npx create-tina-app@latest
\`\`\`

This will scaffold a new Next.js project with Tina CMS pre-configured.

## Project Structure

After installation, you'll see a new \`tina\` folder in your project:

\`\`\`
tina/
├── config.ts      # Main Tina configuration
├── collections/   # Content schemas
└── __generated__/ # Auto-generated types
\`\`\`

## Creating Your First Collection

Collections define the structure of your content. Here's an example of a simple blog post collection:

\`\`\`typescript
import { defineConfig, defineSchema } from 'tinacms'

const schema = defineSchema({
  collections: [
    {
      name: 'post',
      label: 'Blog Posts',
      path: 'content/posts',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
          required: true,
        },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Body',
          isBody: true,
        },
      ],
    },
  ],
})
\`\`\`

## Visual Editing

One of Tina's most powerful features is visual editing. Content editors can click directly on content elements and edit them in place, seeing changes in real-time.

To enable visual editing, wrap your components with Tina's useTina hook:

\`\`\`typescript
import { useTina } from 'tinacms/dist/react'

export function BlogPost({ query, variables }) {
  const { data } = useTina({
    query,
    variables,
    data: initialData,
  })

  return <article>{data.post.body}</article>
}
\`\`\`

## Next Steps

Now that you have Tina set up, you can:
- Add more collections for different content types
- Customize the editing experience
- Deploy to production with Tina Cloud

Happy building!
    `,
  },
  "block-based-editing": {
    title: "Building Block-Based Pages",
    excerpt: "Discover how to create flexible, reusable blocks that content editors will love.",
    author: "Mike Johnson",
    authorRole: "Head of Design",
    authorAvatar: "https://placehold.co/100x100/6366f1/ffffff?text=MJ",
    date: "January 10, 2024",
    category: "Tutorial",
    featuredImage: "https://placehold.co/1200x600/8b5cf6/ffffff?text=Block+Based+Editing",
    content: `
# Building Block-Based Pages

Block-based editing is a game-changer for content teams. Instead of rigid templates, editors can compose pages from reusable building blocks.

## What Are Blocks?

Blocks are self-contained content components that can be arranged in any order. Think of them like LEGO bricks for your website.

Common block types include:
- Hero sections
- Feature grids
- Testimonials
- Call-to-action sections
- Pricing tables

## Defining Blocks in Tina

In Tina, blocks are defined as templates within an object field:

\`\`\`typescript
{
  name: 'blocks',
  type: 'object',
  list: true,
  templates: [
    heroBlock,
    featuresBlock,
    testimonialsBlock,
  ],
}
\`\`\`

## The Power of Variants

Each block can have multiple variants - different visual styles or layouts. For example, a Hero block might have:
- Centered (text in the middle)
- Split (text left, image right)
- Video background
- Gradient background

This gives content editors creative flexibility without needing developer help.

## Best Practices

1. **Keep blocks focused** - Each block should do one thing well
2. **Use consistent props** - Similar properties across blocks (headline, theme, etc.)
3. **Provide sensible defaults** - Pre-fill common values
4. **Add visual previews** - Help editors choose the right block

Block-based editing transforms how teams work with content. Start building your block library today!
    `,
  },
};

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = posts[resolvedParams.slug];

  if (!post) {
    notFound();
  }

  return (
    <>
      <article>
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />
          </div>
          <Container className="relative py-32">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-300 bg-indigo-900/50 rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <p className="text-xl text-gray-300 mb-8">{post.excerpt}</p>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={post.authorAvatar}
                    alt={post.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author}</p>
                  <p className="text-sm text-gray-400">
                    {post.authorRole} · {post.date}
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Content */}
        <section className="py-16">
          <Container size="narrow">
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }} />
            </div>
          </Container>
        </section>

        {/* Back to Blog */}
        <section className="pb-20">
          <Container size="narrow">
            <div className="border-t pt-8">
              <Button href="/blog" variant="outline" color="primary">
                ← Back to Blog
              </Button>
            </div>
          </Container>
        </section>
      </article>
    </>
  );
}

// Simple markdown to HTML converter (in production, use a proper library)
function formatMarkdown(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, (match) => {
      if (match.startsWith('<')) return match;
      return `<p>${match}</p>`;
    });
}
