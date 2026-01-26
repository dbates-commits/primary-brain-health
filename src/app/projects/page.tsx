import { Container } from "@/components/shared/Container";
import { Card, CardTitle, CardDescription } from "@/components/shared/Card";
import Link from "next/link";
import Image from "next/image";

// Sample projects (in a real app, this would come from Tina)
const projects = [
  {
    slug: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "A modern e-commerce solution built with Next.js and Tina CMS for managing products and content.",
    client: "ShopMax Inc",
    category: "E-commerce",
    featuredImage: "https://placehold.co/800x600/6366f1/ffffff?text=E-Commerce",
    techStack: ["Next.js", "Tina CMS", "Stripe", "Tailwind"],
  },
  {
    slug: "saas-marketing-site",
    title: "SaaS Marketing Site",
    description: "High-converting marketing website with dynamic landing pages and A/B testing capabilities.",
    client: "CloudTech Solutions",
    category: "Web Development",
    featuredImage: "https://placehold.co/800x600/8b5cf6/ffffff?text=SaaS+Site",
    techStack: ["Next.js", "Tina CMS", "Vercel", "Analytics"],
  },
  {
    slug: "blog-platform",
    title: "Multi-Author Blog Platform",
    description: "Content platform supporting multiple authors, categories, and rich media content.",
    client: "MediaHub",
    category: "Content Platform",
    featuredImage: "https://placehold.co/800x600/6366f1/ffffff?text=Blog+Platform",
    techStack: ["Next.js", "Tina CMS", "MDX", "Search"],
  },
  {
    slug: "portfolio-showcase",
    title: "Creative Portfolio",
    description: "Stunning portfolio website with visual editing and gallery management.",
    client: "Design Studio",
    category: "Portfolio",
    featuredImage: "https://placehold.co/800x600/8b5cf6/ffffff?text=Portfolio",
    techStack: ["Next.js", "Tina CMS", "Framer Motion"],
  },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-gray-900 py-20">
        <Container>
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore our portfolio of projects built with Tina CMS
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`}>
                <Card variant="ghost" padding="none" hover className="group overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={project.featuredImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="py-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {project.category}
                      </span>
                      <span className="text-sm text-gray-500">{project.client}</span>
                    </div>
                    <CardTitle className="mb-2 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
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
