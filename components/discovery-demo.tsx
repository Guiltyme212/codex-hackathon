"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileText, Globe2, LoaderCircle, ScanSearch } from "lucide-react";
import { kokoroProfile, type BrandProfile } from "@/lib/brand-profile";

type Mode = "website" | "description";
type Status = "idle" | "scanning" | "error";

const scanStages = [
  "Reading the product story",
  "Capturing visual identity",
  "Mapping audience language",
  "Writing launch angles",
];

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function DiscoveryDemo() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>("website");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [scanStage, setScanStage] = useState(0);
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

  async function discoverProfile() {
    if (mode === "website" && !url.trim()) return kokoroProfile;

    const response = await fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "website" ? { url } : { description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "We could not read that context.");
    return data.profile as BrandProfile;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setScanStage(0);
    setStatus("scanning");

    const stageTimer = window.setInterval(() => {
      setScanStage((current) => Math.min(current + 1, scanStages.length - 1));
    }, 470);

    try {
      const [profile] = await Promise.all([discoverProfile(), wait(2100)]);
      setScanStage(scanStages.length - 1);
      await wait(180);
      openWorkspace(profile);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not read that context.");
      setStatus("error");
      window.requestAnimationFrame(() => {
        if (mode === "website") inputRef.current?.focus();
        else descriptionRef.current?.focus();
      });
    } finally {
      window.clearInterval(stageTimer);
    }
  }

  return (
    <section className={`hero-discovery status-${status}`} id="demo" aria-label="Discover your app">
      <div className="discovery-overline">
        <span>Turn your app into marketing</span>
        <span><i /> Kokoro demo ready</span>
      </div>

      {status === "scanning" ? (
        <div className="discovery-scan" aria-live="polite">
          <div className="scan-brand-mark">
            <Image src="/demo/kokoro-logo.png" alt="" width={74} height={74} />
            <span><LoaderCircle className="spin" size={18} aria-hidden="true" /></span>
          </div>
          <div className="scan-copy">
            <small>DISCOVERING {url.trim() || (mode === "website" ? "KOKOROMIND.COM" : "YOUR APP")}</small>
            <strong>{scanStages[scanStage]}</strong>
            <div className="scan-progress"><i style={{ transform: `scaleX(${(scanStage + 1) / scanStages.length})` }} /></div>
          </div>
          <ol className="scan-stage-list">
            {scanStages.map((stage, index) => (
              <li key={stage} className={index <= scanStage ? "is-complete" : ""}>
                {index < scanStage ? <Check size={12} aria-hidden="true" /> : <ScanSearch size={12} aria-hidden="true" />}
                {stage}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
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
                <input ref={inputRef} id="website-url" name="website" type="url" inputMode="url" autoComplete="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="kokoromind.com" aria-invalid={status === "error"} aria-describedby="discovery-status" />
              </div>
            ) : (
              <div className="discovery-description-field">
                <label className="sr-only" htmlFor="product-description">Product description</label>
                <textarea ref={descriptionRef} id="product-description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does your app do, who is it for, and what painful problem does it solve?" aria-invalid={status === "error"} aria-describedby="discovery-status" />
              </div>
            )}
            <button type="submit">
              <span>{mode === "website" ? "Discover app" : "Build brand studio"}</span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </form>

          <div className="hero-discovery-state" id="discovery-status" aria-live="polite">
            {status === "error" ? <p className="compact-error" role="alert">{error}</p> : <p>{mode === "website" ? "Leave the gray demo URL untouched and click Discover app." : "Your brief stays editable after discovery."}</p>}
          </div>
        </>
      )}
    </section>
  );
}
