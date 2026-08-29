export type BrandProfile = {
  name: string;
  url: string;
  description: string;
  image?: string;
  themeColor?: string;
  signals: string[];
  product: string;
  audience: string[];
  problem: string;
  benefits: string[];
  tone: string[];
  avoid: string[];
  positioning: string;
  mission: string;
  evidence: string[];
  contentAngles: string[];
};

export const contentFactoryProfile: BrandProfile = {
  name: "Content Factory",
  url: "https://contentfactory.app",
  description:
    "A growth system that turns an app website into positioning, content angles, and campaigns founders can ship.",
  themeColor: "#ff765f",
  signals: [
    "Founder-first distribution",
    "Sharp editorial voice",
    "Brand-aware campaign generation",
    "Fast approval workflow",
  ],
  product:
    "A Brand OS and campaign studio that learns an app, maps its strongest positioning, and turns those signals into ready-to-ship content.",
  audience: [
    "App founders who built faster than they can distribute",
    "Small teams without a full content department",
    "Product builders who need repeatable demand generation",
  ],
  problem:
    "Building software has accelerated, but finding the right positioning and shipping consistent campaigns is still slow, fragmented work.",
  benefits: [
    "Turn one website into a structured Brand OS",
    "Find audience-native angles instead of guessing at prompts",
    "Approve and ship complete campaigns from one studio",
  ],
  tone: ["Direct and founder-literate", "Editorial, not corporate", "Confident without hype"],
  avoid: ["Generic AI claims", "Growth-hack clichés", "Prompt-box language"],
  positioning:
    "The growth system for app founders. Content Factory turns what you already built into the positioning and campaigns people can actually discover.",
  mission:
    "Close the gap between shipping a product and earning the attention it deserves.",
  evidence: [
    "Website-to-Brand-OS onboarding",
    "Editable positioning and audience signals",
    "Campaign ideation, approvals, and learnings in one workflow",
  ],
  contentAngles: [
    "Your app is not invisible—your positioning is",
    "Building the app got easy; getting it seen did not",
    "One website in, a campaign system out",
    "Stop prompting and start shipping",
    "Distribution is a product problem too",
  ],
};
