"use client";

import React from "react";
import { Container } from "@/components/shared/Container";
import { Card } from "@/components/shared/Card";
import { Heading } from "@/components/shared/Heading";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TeamMember {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface TeamProps {
  variant?: "grid" | "carousel" | "list";
  theme?: "light" | "dark";
  headline?: string;
  subheadline?: string;
  columns?: "2" | "3" | "4";
  members?: TeamMember[];
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    name: "text-gray-900",
    role: "text-indigo-600",
    bio: "text-gray-600",
    cardBg: "bg-gray-50",
    socialIcon: "text-gray-400 hover:text-gray-600",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    name: "text-white",
    role: "text-indigo-400",
    bio: "text-gray-400",
    cardBg: "bg-gray-800",
    socialIcon: "text-gray-500 hover:text-gray-300",
  },
};

const columnClasses = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "md:grid-cols-2 lg:grid-cols-4",
};

function SocialIcon({ platform, url, className }: { platform: string; url: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg className={cn("w-5 h-5", className)} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg className={cn("w-5 h-5", className)} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg className={cn("w-5 h-5", className)} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {icons[platform]}
    </a>
  );
}

export function Team({
  variant = "grid",
  theme = "light",
  headline,
  subheadline,
  columns = "3",
  members = [],
}: TeamProps) {
  const styles = themeStyles[theme];

  if (variant === "grid") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className={cn("grid gap-8", columnClasses[columns])}>
            {members.map((member, index) => (
              <div key={index} className="text-center">
                {member.avatar && (
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                  </div>
                )}
                <h3 className={cn("text-xl font-semibold", styles.name)}>{member.name}</h3>
                {member.role && (
                  <p className={cn("text-sm font-medium mb-2", styles.role)}>{member.role}</p>
                )}
                {member.bio && (
                  <p className={cn("text-sm mb-4", styles.bio)}>{member.bio}</p>
                )}
                {member.social && (
                  <div className="flex justify-center gap-4">
                    {member.social.twitter && (
                      <SocialIcon platform="twitter" url={member.social.twitter} className={styles.socialIcon} />
                    )}
                    {member.social.linkedin && (
                      <SocialIcon platform="linkedin" url={member.social.linkedin} className={styles.socialIcon} />
                    )}
                    {member.social.github && (
                      <SocialIcon platform="github" url={member.social.github} className={styles.socialIcon} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "carousel") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-6" style={{ width: `${members.length * 300}px` }}>
              {members.map((member, index) => (
                <Card key={index} variant="bordered" className={cn("w-[280px] flex-shrink-0 text-center", styles.cardBg)}>
                  {member.avatar && (
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                    </div>
                  )}
                  <h3 className={cn("text-lg font-semibold", styles.name)}>{member.name}</h3>
                  {member.role && (
                    <p className={cn("text-sm font-medium mb-2", styles.role)}>{member.role}</p>
                  )}
                  {member.bio && (
                    <p className={cn("text-sm", styles.bio)}>{member.bio}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // List variant
  return (
    <section className={cn("py-20", styles.bg)}>
      <Container size="narrow">
        {(headline || subheadline) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {headline && (
              <Heading size="md" className={cn("mb-4", styles.headline)}>
                {headline}
              </Heading>
            )}
            {subheadline && (
              <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
            )}
          </div>
        )}
        <div className="space-y-8">
          {members.map((member, index) => (
            <div key={index} className="flex items-start gap-6">
              {member.avatar && (
                <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
                  <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className={cn("text-xl font-semibold", styles.name)}>{member.name}</h3>
                {member.role && (
                  <p className={cn("text-sm font-medium mb-2", styles.role)}>{member.role}</p>
                )}
                {member.bio && <p className={cn("text-sm", styles.bio)}>{member.bio}</p>}
                {member.social && (
                  <div className="flex gap-4 mt-3">
                    {member.social.twitter && (
                      <SocialIcon platform="twitter" url={member.social.twitter} className={styles.socialIcon} />
                    )}
                    {member.social.linkedin && (
                      <SocialIcon platform="linkedin" url={member.social.linkedin} className={styles.socialIcon} />
                    )}
                    {member.social.github && (
                      <SocialIcon platform="github" url={member.social.github} className={styles.socialIcon} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
