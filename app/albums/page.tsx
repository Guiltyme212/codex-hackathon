import type { Metadata } from "next";
import { AlbumsLibrary } from "@/components/albums-library";

export const metadata: Metadata = {
  title: "Albums — Content Factory",
  description: "Review carousel campaigns, slides, and captions in one place.",
};

export default function AlbumsPage() {
  return <AlbumsLibrary />;
}
