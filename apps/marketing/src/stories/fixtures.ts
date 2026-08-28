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
