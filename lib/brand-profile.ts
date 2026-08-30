export type BrandProfile = {
  name: string;
  url: string;
  description: string;
  logo?: string;
  image?: string;
  themeColor?: string;
  palette?: string[];
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

export const kokoroProfile: BrandProfile = {
  name: "Kokoro",
  url: "https://kokoromind.com",
  description:
    "A meditation made from your own words. Speak what is really happening, then receive a private 3–7 minute meditation in a voice that fits the moment.",
  logo: "/demo/kokoro-logo.png",
  image: "/albums/kokoro/slide_01.jpg",
  themeColor: "#FC6708",
  palette: ["#FCF0DB", "#1B1B1B", "#787838", "#ECC34A", "#FC6708"],
  signals: [
    "Private voice-first ritual",
    "Japanese warmth and restraint",
    "Validation before advice",
    "A different voice for every mood",
  ],
  product:
    "Kokoro listens to what is on your mind and turns your own words into a personalized meditation.",
  audience: [
    "Quiet humans carrying too much after a long day",
    "People who want comfort without therapy-speak",
    "Anyone who finds ordinary meditation too generic",
  ],
  problem:
    "Most wellness apps ask people to follow a generic script when what they need first is to feel heard.",
  benefits: [
    "Vent naturally instead of finding the right prompt",
    "Receive a meditation shaped around the actual day",
    "Stay private—nothing shared, scored, or performed",
  ],
  tone: ["Lowercase and intimate", "Honest, warm, slightly irreverent", "Never trying to fix the person"],
  avoid: ["Toxic positivity", "Clinical therapy language", "Productivity framing", "Hard selling"],
  positioning:
    "The meditation app that listens first. Kokoro turns one honest voice note into a meditation made for this exact moment.",
  mission:
    "Give people a small private place to put the day down without asking them to explain it perfectly.",
  evidence: [
    "“Vent your mind. Change your life.”",
    "“Say one thing. Get a meditation that fits.”",
    "“I won’t try to fix you. I’ll just listen.”",
  ],
  contentAngles: [
    "for everyone who held it together all day",
    "you do not need another habit—you need somewhere to put the day",
    "POV: you said ‘i’m tired’ and the app actually understood",
    "the meditation starts with your words, not a stranger’s script",
    "the day is over. you can put it down now",
  ],
};

export const contentFactoryProfile: BrandProfile = {
  name: "Content Factory",
  url: "https://contentfactory.app",
  description:
    "A growth system that turns an app website into positioning, content angles, and campaigns founders can ship.",
  themeColor: "#ff765f",
  palette: ["#F5F1E8", "#141512", "#C8FF5C", "#FF765F", "#8B8FFF"],
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
