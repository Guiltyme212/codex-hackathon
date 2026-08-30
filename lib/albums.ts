import type { BrandProfile } from "@/lib/brand-profile";

export type CarouselSlide = {
  id: string;
  copy: string;
  image?: string;
  role: "hook" | "value" | "share" | "cta";
};

export type ContentAlbum = {
  id: string;
  title: string;
  brand: string;
  format: "Carousel";
  status: "Published" | "Ready" | "Draft";
  caption: string;
  accent: string;
  slides: CarouselSlide[];
};

function imageSlides(folder: string, copies: string[]): CarouselSlide[] {
  return copies.map((copy, index) => ({
    id: `${folder}-${index + 1}`,
    copy,
    image: `/albums/${folder}/slide_${String(index + 1).padStart(2, "0")}.jpg`,
    role: index === 0 ? "hook" : index === copies.length - 1 ? "cta" : index === copies.length - 2 ? "share" : "value",
  }));
}

export const seededAlbums: ContentAlbum[] = [
  {
    id: "kokoro-held-it-together",
    title: "For everyone who held it together all day",
    brand: "Kokoro",
    format: "Carousel",
    status: "Ready",
    accent: "#f5a38f",
    caption: "for everyone who held it together all day 🌸 what was the heaviest part of yours?\n\n#mentalhealthtok #selfcaretok #meditation #softlife #emotionalwellness",
    slides: imageSlides("kokoro", [
      "for everyone who held it together all day",
      "you answered every message like nothing was wrong",
      "you made everyone else feel safe",
      "you called it being fine",
      "you are just tired of being the strong one",
      "the day is over. you can put it down now",
      "i vent to kokoro. it listens—then makes a meditation from my own words",
    ]),
  },
  {
    id: "nature-brain",
    title: "Your brain was built for the forest",
    brand: "Editorial test",
    format: "Carousel",
    status: "Published",
    accent: "#71824f",
    caption: "your brain wasn't built for 9 hours of screens a day 🌲 which fact surprised you?\n\n#naturetherapy #mentalhealth #psychologyfacts #forestbathing #wellbeing #grounding",
    slides: imageSlides("nature-brain", [
      "doctors in Japan prescribe forest walks instead of pills",
      "your nervous system notices trees before you do",
      "twenty quiet minutes can change the shape of a day",
      "the body reads a forest as permission",
      "rest is an environment, not a reward",
      "save this for the next day that feels too loud",
      "your brain is 300,000 years old. it still thinks it lives out here",
    ]),
  },
];

export const carouselRules = {
  slideCount: 7,
  maxWordsPerSlide: 20,
  structure: ["Hook", "Validation", "Validation", "Value", "Share trigger", "Warmup", "Soft CTA"],
};

function trimWords(value: string, maxWords = carouselRules.maxWordsPerSlide) {
  return value.trim().split(/\s+/).slice(0, maxWords).join(" ");
}

export function buildCarouselDraft(profile: BrandProfile, hook: string): ContentAlbum {
  const audience = profile.audience[0] ?? "people who need this";
  const slides = [
    trimWords(hook),
    trimWords(`for ${audience.toLowerCase()}`),
    trimWords(profile.problem),
    trimWords(profile.benefits[0] ?? profile.product),
    trimWords(`send this to someone who needs to hear it today`),
    trimWords(profile.mission),
    trimWords(`${profile.name}: ${profile.positioning}`),
  ];

  return {
    id: `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    title: hook,
    brand: profile.name,
    format: "Carousel",
    status: "Draft",
    accent: profile.themeColor || "#c8ff5c",
    caption: `${hook} What part feels most familiar?\n\n#appfounder #buildinpublic #productmarketing #contentstrategy`,
    slides: slides.map((copy, index) => ({
      id: `draft-${index + 1}`,
      copy,
      role: index === 0 ? "hook" : index === 6 ? "cta" : index === 4 ? "share" : "value",
    })),
  };
}
