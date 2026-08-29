"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, Check, Globe2, LoaderCircle, RotateCcw } from "lucide-react";

type Profile = {
  name: string;
  url: string;
  description: string;
  themeColor?: string;
  signals: string[];
};

const kokoroProfile: Profile = {
  name: "Kokoro",
  url: "kokoromind.com",
  description: "A voice-first space to unload your day and receive a meditation made from your own words.",
  themeColor: "#eea89b",
  signals: ["voice-first wellness", "quiet, intimate tone", "personalized meditation", "evening decompression"],
};

function isKokoroDemo(value: string) {
  if (!value.trim()) return true;
  const hostname = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  return hostname === "kokoromind.com" || hostname.endsWith(".kokoromind.com");
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function DiscoveryDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "ready" | "error">("idle");
  const [profile, setProfile] = useState<Profile>(kokoroProfile);
  const [error, setError] = useState("");
  const [briefBuilt, setBriefBuilt] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBriefBuilt(false);
    setStatus("scanning");

    if (isKokoroDemo(url)) {
      await wait(650);
      setProfile(kokoroProfile);
      setStatus("ready");
      return;
    }

    try {
      const response = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      setProfile(data.profile);
      setStatus("ready");
    } catch {
      setError("We couldn’t read that site. Check the URL or try another public homepage.");
      setStatus("error");
      inputRef.current?.focus();
    }
  }

  function reset() {
    setUrl("");
    setStatus("idle");
    setError("");
    setBriefBuilt(false);
  }

  return (
    <section className={`hero-discovery status-${status}`} id="demo" aria-label="Discover your app">
      <div className="discovery-overline">
        <span>Start here</span>
        <span><i /> Kokoro demo preloaded</span>
      </div>

      <form className="hero-discovery-form" onSubmit={handleSubmit} noValidate>
        <div className="discovery-url-field">
          <Globe2 size={20} aria-hidden="true" />
          <label className="sr-only" htmlFor="website-url">App website</label>
          <input
            ref={inputRef}
            id="website-url"
            name="website"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://kokoromind.com…"
            aria-invalid={status === "error"}
            aria-describedby="discovery-status"
          />
        </div>
        <button type="submit" disabled={status === "scanning"}>
          <span>{status === "scanning" ? "Reading…" : "Discover App"}</span>
          {status === "scanning" ? <LoaderCircle className="spin" size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </form>

      <div className="hero-discovery-state" id="discovery-status" aria-live="polite">
        {status === "idle" ? (
          <p>Paste any app website—or click Discover App to use Kokoro.</p>
        ) : status === "scanning" ? (
          <div className="compact-progress"><i /></div>
        ) : status === "error" ? (
          <p className="compact-error" role="alert">{error}</p>
        ) : (
          <div className="compact-profile">
            <div className="compact-app" style={{ background: profile.themeColor ?? "#c8ff5c" }}>
              {profile.name.slice(0, 1).toLowerCase()}
            </div>
            <div className="compact-profile-copy">
              <span><Check size={13} aria-hidden="true" /> App Discovered</span>
              <strong>{profile.name}</strong>
              <small>{profile.signals.length} brand signals matched</small>
            </div>
            <button
              className="compact-build-button"
              type="button"
              onClick={() => setBriefBuilt(true)}
              disabled={briefBuilt}
            >
              {briefBuilt ? <><Check size={16} aria-hidden="true" /> Brief Ready</> : <>Build Brief <ArrowRight size={16} aria-hidden="true" /></>}
            </button>
            <button className="compact-reset" type="button" onClick={reset} aria-label="Try another website">
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
