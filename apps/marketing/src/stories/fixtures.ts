/**
 * Shared sample data for the block stories.
 *
 * Blocks are driven by Tina content, so every story needs a fixture standing in
 * for a CMS document. Keeping the assets and the longer item arrays here stops
 * eighteen story files from each inventing their own copy. Asset paths resolve
 * against `staticDirs: ["../public"]` in `.storybook/main.ts`.
 */

export const IMAGES = {
  laughingCouple: "/images/laughing-couple.png",
  doctorIpad: "/images/doctor-showing-ipad.png",
  doctorPrescription: "/images/doctor-writing-prescription.png",
  heroConsultation: "/images/hero-brain-consultation.webp",
  woman: "/images/woman.png",
  logo: "/images/pbh-logo.png",
  logoStacked: "/images/pbh_logostacked_color.svg",
  logomark: "/images/pbh-logomark.svg",
} as const;

export const VIDEOS = {
  hero: "/videos/hero-video.mp4",
  broll: "/videos/7677135-hd_1920_1080_30fps.mp4",
} as const;

export const FAQ_ITEMS = [
  {
    question: "Is this a diagnosis?",
    answer:
      "No. The assessment establishes a cognitive baseline and flags whether further clinical evaluation is warranted. Any diagnosis comes from your physician.",
    category: "Clinical",
  },
  {
    question: "How long does the assessment take?",
    answer: "About 30 minutes, taken at home on a tablet or computer.",
    category: "Process",
  },
  {
    question: "Who reviews my results?",
    answer:
      "A licensed clinician trained in cognitive assessment reviews every result before it is released.",
    category: "Clinical",
  },
  {
    question: "Is my health information protected?",
    answer:
      "Yes. Your data is handled under HIPAA safeguards and is never sold or shared for marketing.",
    category: "Privacy",
  },
  {
    question: "Do you take insurance?",
    answer:
      "Not currently. The program is self-pay, and we publish pricing up front so there are no surprises.",
    category: "Billing",
  },
];

export const TESTIMONIAL_ITEMS = [
  {
    quote:
      "I had been worried for two years and kept putting it off. Getting an actual baseline was the first time I felt like I had information instead of anxiety.",
    authorName: "Margaret H.",
    authorRole: "Member since 2024",
    avatar: IMAGES.woman,
    rating: 5,
  },
  {
    quote:
      "The clinician walked me through every number. I left understanding what was normal for my age and what to watch.",
    authorName: "David O.",
    authorRole: "Member since 2025",
    rating: 5,
  },
  {
    quote:
      "My mother has Alzheimer's. Establishing my own baseline now felt like the single most useful thing I could do.",
    authorName: "Renée T.",
    authorRole: "Member since 2025",
    rating: 5,
  },
];

/**
 * Note the prices carry no `$` — `PricingTable` renders `${tier.price}` itself,
 * so a leading dollar sign in the content produces `$$249`.
 */
export const PRICING_TIERS = [
  {
    name: "Baseline",
    price: "249",
    period: "once" as const,
    description: "A single cognitive assessment with clinician review.",
    features: [
      "30-minute validated assessment",
      "Clinician-reviewed results",
      "Written summary within 3 business days",
    ],
    buttonText: "Get Started",
    buttonLink: "#intake",
  },
  {
    name: "Comprehensive",
    price: "1,200",
    period: "year" as const,
    description: "Ongoing measurement with a personalised plan.",
    features: [
      "30-minute validated assessment",
      "Clinician-reviewed results",
      "Quarterly re-assessment",
      "Personalised 12-month plan",
      "Direct clinician messaging",
    ],
    buttonText: "Get Started",
    buttonLink: "#intake",
    highlighted: true,
    badge: "Most chosen",
  },
  {
    name: "Family",
    price: "2,000",
    period: "year" as const,
    description: "Comprehensive coverage for two members.",
    features: [
      "Quarterly re-assessment",
      "Personalised 12-month plan",
      "Shared care navigator",
      "Family history review",
    ],
    buttonText: "Talk to Us",
    buttonLink: "#contact",
  },
];

export const STAT_ITEMS = [
  { value: "1 in 9", label: "Adults 65+ with Alzheimer's", icon: "users", progress: 11 },
  { value: "30 min", label: "To complete an assessment", icon: "clock", progress: 50 },
  { value: "3 days", label: "To clinician-reviewed results", icon: "check", progress: 75 },
  { value: "20 yrs", label: "Changes precede symptoms", icon: "chart", progress: 90 },
];

export const GALLERY_ITEMS = [
  { image: IMAGES.laughingCouple, alt: "Two people laughing together", caption: "Living well" },
  { image: IMAGES.doctorIpad, alt: "Clinician reviewing results on a tablet", caption: "Clinician review" },
  { image: IMAGES.doctorPrescription, alt: "Clinician writing a care plan", caption: "Your plan" },
  { image: IMAGES.heroConsultation, alt: "A brain health consultation", caption: "Consultation" },
  { image: IMAGES.woman, alt: "Portrait of a member", caption: "Members" },
  { image: IMAGES.laughingCouple, alt: "Two people laughing together", caption: "Follow-up" },
];

/** Items for the stacked scroll sections and the benefits list. */
export const BENEFIT_ITEMS = [
  {
    title: "Measure, don't guess",
    body: "A validated assessment gives you a number to track instead of a feeling to worry about.",
    icon: "chart",
  },
  {
    title: "Catch change early",
    body: "Brain changes begin up to twenty years before symptoms. Early is when action matters most.",
    icon: "clock",
  },
  {
    title: "A real plan",
    body: "Sleep, vascular health, hearing, activity — the levers that actually move cognition.",
    icon: "check",
  },
];
