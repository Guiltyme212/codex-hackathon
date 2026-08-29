"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Globe2, LoaderCircle } from "lucide-react";
import { contentFactoryProfile, type BrandProfile } from "@/lib/brand-profile";

type Mode = "website" | "description";

function isPreloadedDemo(value: string) {
  return !value.trim();
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function DiscoveryDemo() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>("website");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "error">("idle");
  const [error, setError] = useState("");

  function selectMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setStatus("idle");
    window.requestAnimationFrame(() => {
      if (nextMode === "website") inputRef.current?.focus();
      else descriptionRef.current?.focus();
    });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentMode: Mode) {
    const modes: Mode[] = ["website", "description"];
    const currentIndex = modes.indexOf(currentMode);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % modes.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + modes.length) % modes.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = modes.length - 1;
    else return;

    event.preventDefault();
    selectMode(modes[nextIndex]);
    window.requestAnimationFrame(() => document.getElementById(`discovery-tab-${modes[nextIndex]}`)?.focus());
  }

  function openWorkspace(profile: BrandProfile) {
    window.sessionStorage.setItem("content-factory-profile", JSON.stringify(profile));
    router.push("/workspace");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("scanning");

    if (mode === "website" && isPreloadedDemo(url)) {
      await wait(720);
      openWorkspace(contentFactoryProfile);
      return;
    }

    try {
      const request = fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "website" ? { url } : { description }),
      });
      const [response] = await Promise.all([request, wait(720)]);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not read that context.");
      openWorkspace(data.profile);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not read that context.");
      setStatus("error");
      if (mode === "website") inputRef.current?.focus();
      else descriptionRef.current?.focus();
    }
  }

  return (
    <section className={`hero-discovery status-${status}`} id="demo" aria-label="Discover your app">
      <div className="discovery-overline">
        <span>Build your Brand OS</span>
        <span><i /> Brand OS demo preloaded</span>
      </div>

      <div className="discovery-mode-tabs" role="tablist" aria-label="How should we learn your app?">
        <button id="discovery-tab-website" type="button" role="tab" aria-selected={mode === "website"} aria-controls="discovery-panel-website" tabIndex={mode === "website" ? 0 : -1} onKeyDown={(event) => handleTabKeyDown(event, "website")} onClick={() => selectMode("website")}>
          <Globe2 size={15} aria-hidden="true" /> Website
        </button>
        <button id="discovery-tab-description" type="button" role="tab" aria-selected={mode === "description"} aria-controls="discovery-panel-description" tabIndex={mode === "description" ? 0 : -1} onKeyDown={(event) => handleTabKeyDown(event, "description")} onClick={() => selectMode("description")}>
          <FileText size={15} aria-hidden="true" /> No website yet
        </button>
      </div>

      <form id={`discovery-panel-${mode}`} role="tabpanel" aria-labelledby={`discovery-tab-${mode}`} className={`hero-discovery-form mode-${mode}`} onSubmit={handleSubmit} noValidate>
        {mode === "website" ? (
          <div className="discovery-url-field">
            <Globe2 size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="website-url">App website</label>
            <input
              ref={inputRef}
              id="website-url"
              name="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://yourapp.com…"
              aria-invalid={status === "error"}
              aria-describedby="discovery-status"
            />
          </div>
        ) : (
          <div className="discovery-description-field">
            <label className="sr-only" htmlFor="product-description">Product description</label>
            <textarea
              ref={descriptionRef}
              id="product-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does your app do, who is it for, and what painful problem does it solve?"
              aria-invalid={status === "error"}
              aria-describedby="discovery-status"
            />
          </div>
        )}
        <button type="submit" disabled={status === "scanning"}>
          <span>{status === "scanning" ? "Mapping…" : mode === "website" ? "Discover app" : "Build Brand OS"}</span>
          {status === "scanning" ? <LoaderCircle className="spin" size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </form>

      <div className="hero-discovery-state" id="discovery-status" aria-live="polite">
        {status === "scanning" ? (
          <div className="compact-progress" aria-label="Mapping product, audience, and content opportunities"><i /></div>
        ) : status === "error" ? (
          <p className="compact-error" role="alert">{error}</p>
        ) : (
          <p>{mode === "website" ? "Paste any app website—or run the preloaded Content Factory demo." : "Your description stays editable in the Brand OS."}</p>
        )}
      </div>
    </section>
  );
}
