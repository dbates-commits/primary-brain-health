import { notFound } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import { Gallery } from "@/components/blocks/Gallery";
import { Stats } from "@/components/blocks/Stats";
import { Testimonials } from "@/components/blocks/Testimonials";
import Image from "next/image";

// Sample projects (in a real app, this would come from Tina)
const projects: Record<string, {
  title: string;
  description: string;
  client: string;
  category: string;
  featuredImage: string;
  techStack: string[];
  challenge: string;
  solution: string;
  gallery: { image: string; alt: string; caption?: string }[];
  stats: { value: string; label: string }[];
  testimonial?: {
    quote: string;
    authorName: string;
    authorRole: string;
    company: string;
  };
  liveUrl?: string;
}> = {
  "ecommerce-platform": {
    title: "E-Commerce Platform",
    description: "A modern e-commerce solution built with Next.js and Tina CMS for managing products and content.",
    client: "ShopMax Inc",
    category: "E-commerce",
    featuredImage: "https://placehold.co/1200x600/6366f1/ffffff?text=E-Commerce+Platform",
    techStack: ["Next.js", "Tina CMS", "Stripe", "Tailwind CSS", "Vercel"],
    challenge: "ShopMax needed a flexible e-commerce platform that would allow their marketing team to create and manage landing pages without developer involvement, while maintaining a consistent brand experience across thousands of products.",
    solution: "We built a headless e-commerce platform using Next.js for the frontend and Tina CMS for content management. The block-based page builder allows marketers to create promotional pages, while the product catalog integrates seamlessly with their inventory system. Stripe handles payments with custom checkout flows.",
    gallery: [
      { image: "https://placehold.co/800x600/6366f1/ffffff?text=Homepage", alt: "Homepage", caption: "The responsive homepage with featured products" },
      { image: "https://placehold.co/800x600/8b5cf6/ffffff?text=Product+Page", alt: "Product Page", caption: "Product detail page with rich media" },
      { image: "https://placehold.co/800x600/6366f1/ffffff?text=Checkout", alt: "Checkout", caption: "Streamlined checkout experience" },
      { image: "https://placehold.co/800x600/8b5cf6/ffffff?text=CMS", alt: "CMS Interface", caption: "Tina CMS content management" },
    ],
    stats: [
      { value: "150%", label: "Increase in Conversions" },
      { value: "40%", label: "Faster Page Loads" },
      { value: "60%", label: "Reduction in Dev Time" },
      { value: "10K+", label: "Products Managed" },
    ],
    testimonial: {
      quote: "The new platform has transformed how we work. Our marketing team can now launch campaigns in hours instead of weeks, and our conversion rates have never been higher.",
      authorName: "Jennifer Adams",
      authorRole: "VP of Marketing",
      company: "ShopMax Inc",
    },
    liveUrl: "https://example.com",
  },
  "saas-marketing-site": {
    title: "SaaS Marketing Site",
    description: "High-converting marketing website with dynamic landing pages and A/B testing capabilities.",
    client: "CloudTech Solutions",
    category: "Web Development",
    featuredImage: "https://placehold.co/1200x600/8b5cf6/ffffff?text=SaaS+Marketing+Site",
    techStack: ["Next.js", "Tina CMS", "Vercel", "Analytics", "TypeScript"],
    challenge: "CloudTech needed a marketing site that could keep up with their rapid growth. They wanted to run experiments, personalize content, and iterate quickly without bottlenecking on development resources.",
    solution: "We created a modular marketing site with Tina CMS powering all content. The block-based system includes specialized components for SaaS features like pricing tables, feature comparisons, and integration showcases. Built-in analytics and A/B testing capabilities allow the team to optimize continuously.",
    gallery: [
      { image: "https://placehold.co/800x600/8b5cf6/ffffff?text=Landing+Page", alt: "Landing Page", caption: "High-converting landing page" },
      { image: "https://placehold.co/800x600/6366f1/ffffff?text=Pricing", alt: "Pricing Page", caption: "Dynamic pricing tables" },
      { image: "https://placehold.co/800x600/8b5cf6/ffffff?text=Features", alt: "Features", caption: "Interactive feature showcase" },
    ],
    stats: [
      { value: "200%", label: "More Qualified Leads" },
      { value: "45%", label: "Higher Engagement" },
      { value: "3x", label: "Faster Time to Market" },
      { value: "25+", label: "Landing Page Variants" },
    ],
    liveUrl: "https://example.com",
  },
};

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const project = projects[resolvedParams.slug];

  if (!project) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />
        </div>
        <Container className="relative py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-300 bg-indigo-900/50 rounded-full mb-4">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-gray-300 mb-4">{project.description}</p>
            <p className="text-gray-400">Client: {project.client}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-sm bg-white/10 text-white px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
            {project.liveUrl && (
              <div className="mt-8">
                <Button href={project.liveUrl} variant="solid" color="white">
                  View Live Site →
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Challenge & Solution */}
      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                The Challenge
              </h2>
              <p className="text-lg text-gray-600">{project.challenge}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                Our Solution
              </h2>
              <p className="text-lg text-gray-600">{project.solution}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <Stats
        variant="counters"
        theme="dark"
        headline="Results"
        items={project.stats}
      />

      {/* Gallery */}
      <Gallery
        variant="lightbox"
        theme="light"
        headline="Project Gallery"
        columns="2"
        gap="medium"
        items={project.gallery}
      />

      {/* Testimonial */}
      {project.testimonial && (
        <Testimonials
          variant="single"
          theme="light"
          items={[project.testimonial]}
        />
      )}

      {/* Back to Projects */}
      <section className="pb-20">
        <Container>
          <div className="border-t pt-8">
            <Button href="/projects" variant="outline" color="primary">
              ← Back to Projects
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
