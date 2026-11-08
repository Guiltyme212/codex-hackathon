import type { Metadata, Viewport } from "next";
import { ThingStudio } from "@/components/thing-studio";

export const metadata: Metadata = {
  title: "thing. | Think it. Make it.",
  description: "Turn your little what-if into a real, 3D-printed thing. Get inspired, make it yours, and preview your next creation.",
};

export const viewport: Viewport = { themeColor: "#f4f0e8" };

export default function MakePage() {
  return <ThingStudio />;
}
