import type { Metadata } from "next";
import { BrandOsWorkspace } from "@/components/brand-os-workspace";

export const metadata: Metadata = {
  title: "Brand OS — Content Factory",
  description: "Turn discovered app context into brand-matched content ideas and launch campaigns.",
};

export default function WorkspacePage() {
  return <BrandOsWorkspace />;
}

