import { Container } from "@/components/shared/Container";
import { Card, CardTitle, CardDescription } from "@/components/shared/Card";
import Link from "next/link";
import Image from "next/image";

// Sample projects (in a real app, this would come from Tina)
const projects = [
  {
    slug: "ecommerce-platform",
    title: "Cognitive Health Research Platform",
    description: "A digital cognitive screening platform used across multiple clinical trial sites, supporting remote and in-clinic assessment modes.",
    client: "National Cognitive Health Institute",
    category: "Research",
    featuredImage: "https://placehold.co/800x600/6366f1/ffffff?text=Research",
    techStack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
  },
  {
    slug: "saas-marketing-site",
    title: "Telehealth Platform for Neurology",
    description: "A virtual care platform enabling a neurology practice to deliver remote consultations and cognitive assessments to patients across multiple states.",
    client: "NeuroWell Clinic",
    category: "Telehealth",
    featuredImage: "https://placehold.co/800x600/8b5cf6/ffffff?text=Telehealth",
    techStack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
  },
  {
    slug: "blog-platform",
    title: "Brain Health Awareness Campaign",
    description: "A public-facing educational website for a brain health nonprofit that drove a 3x increase in community screening sign-ups.",
    client: "BrainStrong Foundation",
    category: "Nonprofit",
    featuredImage: "https://placehold.co/800x600/6366f1/ffffff?text=Awareness",
    techStack: ["Next.js", "TypeScript", "Node.js", "AWS"],
  },
  {
    slug: "portfolio-showcase",
    title: "Patient Education Portal",
    description: "An accessible, content-managed portal providing patients and caregivers with evidence-based resources on cognitive health and dementia prevention.",
    client: "CogCare Health",
    category: "Patient Education",
    featuredImage: "https://placehold.co/800x600/8b5cf6/ffffff?text=Education",
    techStack: ["Next.js", "Tina CMS", "Tailwind"],
  },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-gray-900 py-20">
        <Container>
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Work</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Projects we've built in the brain health and digital healthcare space
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
