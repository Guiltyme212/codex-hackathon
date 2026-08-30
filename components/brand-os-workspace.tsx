"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clapperboard,
  Copy,
  GalleryHorizontalEnd,
  Images,
  Layers3,
  MousePointer2,
  RotateCcw,
  ScanSearch,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildCarouselDraft, type ContentAlbum } from "@/lib/albums";
import { kokoroProfile, type BrandProfile } from "@/lib/brand-profile";

type Decision = "keep" | "pass";

type SwipeIdea = {
  id: string;
  hook: string;
  angle: string;
  why: string;
  tint: string;
};

const ideaTints = ["#f5a38f", "#ecc34a", "#a4a46c", "#8b8fff", "#74c6bd"];

const formats = [
  { id: "carousel", name: "Carousels", detail: "7-slide stories", icon: GalleryHorizontalEnd },
  { id: "ugc", name: "UGC videos", detail: "Hooks + scripts", icon: Clapperboard },
  { id: "ads", name: "Paid creative", detail: "Concepts + variants", icon: Images },
  { id: "threads", name: "Founder posts", detail: "Threads + POVs", icon: Copy },
];

function createIdeas(profile: BrandProfile): SwipeIdea[] {
  return profile.contentAngles.slice(0, 5).map((hook, index) => ({
    id: `${profile.name}-${index}`,
    hook,
    angle: index === 0 ? "Identity mirror" : index === 1 ? "Permission gap" : index === 2 ? "Product moment" : index === 3 ? "Category contrast" : "Emotional payoff",
    why: index === 0
      ? `Makes ${profile.audience[0]?.toLowerCase() ?? "the audience"} feel seen before introducing the product.`
      : `Turns a discovered ${profile.name} signal into a native, testable opening.`,
    tint: ideaTints[index],
  }));
}

export function BrandOsWorkspace() {
  const router = useRouter();
  const [profile, setProfile] = useState<BrandProfile>(kokoroProfile);
  const [visibleIdeas, setVisibleIdeas] = useState(0);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [kept, setKept] = useState<SwipeIdea[]>([]);
  const [passed, setPassed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("Hooks are being generated.");
  const [logoFailed, setLogoFailed] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("carousel");
  const cardRef = useRef<HTMLDivElement>(null);
  const resetDeckRef = useRef<HTMLButtonElement>(null);
  const keepOverlayRef = useRef<HTMLDivElement>(null);
  const passOverlayRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const drag = useRef({ active: false, pointerId: -1, startX: 0, startAt: 0, x: 0 });

  useEffect(() => {
    const loadProfile = window.setTimeout(() => {
      const stored = window.sessionStorage.getItem("content-factory-profile");
      if (!stored) return;
      try {
        setProfile(JSON.parse(stored) as BrandProfile);
      } catch {
        window.sessionStorage.removeItem("content-factory-profile");
      }
    }, 0);
    return () => window.clearTimeout(loadProfile);
  }, []);

  const ideas = useMemo(() => createIdeas(profile), [profile]);
  const activeIdea = ideaIndex < visibleIdeas ? ideas[ideaIndex] : undefined;
  const palette = profile.palette?.length ? profile.palette : ["#f5f1e8", "#151612", profile.themeColor || "#c8ff5c", "#ffffff"];

  useEffect(() => {
    let generationTimer: number | undefined;
    let count = 0;
    const startGeneration = window.setTimeout(() => {
      setVisibleIdeas(0);
      setIdeaIndex(0);
      setKept([]);
      setPassed(0);
      setLogoFailed(false);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setVisibleIdeas(ideas.length);
        setAnnouncement(`${ideas.length} hooks generated.`);
        return;
      }

      generationTimer = window.setInterval(() => {
        count += 1;
        setVisibleIdeas(count);
        setAnnouncement(count === ideas.length ? `${ideas.length} hooks generated.` : `Hook ${count} generated.`);
        if (count >= ideas.length && generationTimer) window.clearInterval(generationTimer);
      }, 360);
    }, 0);

    return () => {
      window.clearTimeout(startGeneration);
      if (generationTimer) window.clearInterval(generationTimer);
    };
  }, [ideas]);

  useEffect(() => {
    if (!kept.length && !passed) return;
    window.localStorage.setItem(
      "content-factory-swipe-v1",
      JSON.stringify({ brand: profile.name, kept: kept.map((idea) => idea.hook), passed }),
    );
  }, [kept, passed, profile.name]);

  function resetCardStyles() {
    if (cardRef.current) {
      cardRef.current.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
      cardRef.current.style.opacity = "1";
    }
    if (keepOverlayRef.current) keepOverlayRef.current.style.opacity = "0";
    if (passOverlayRef.current) passOverlayRef.current.style.opacity = "0";
  }

  function finishDecision(decision: Decision, idea: SwipeIdea) {
    const completesDeck = ideaIndex + 1 >= ideas.length;
    if (decision === "keep") {
      setKept((current) => [...current, idea]);
      setAnnouncement(`Kept “${idea.hook}”.`);
    } else {
      setPassed((current) => current + 1);
      setAnnouncement(`Passed “${idea.hook}”.`);
    }
    setIdeaIndex((current) => current + 1);
    setBusy(false);
    window.requestAnimationFrame(() => {
      resetCardStyles();
      if (completesDeck) resetDeckRef.current?.focus();
      else cardRef.current?.focus();
    });
  }

  function decide(decision: Decision, animate = true) {
    if (!activeIdea || busy) return;
    const idea = activeIdea;
    const card = cardRef.current;

    if (!animate || !card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishDecision(decision, idea);
      return;
    }

    setBusy(true);
    const direction = decision === "keep" ? 1 : -1;
    animationRef.current = card.animate(
      [
        { transform: card.style.transform || "translate3d(0, 0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate3d(${direction * 680}px, -18px, 0) rotate(${direction * 14}deg)`, opacity: 0 },
      ],
      { duration: 230, easing: "cubic-bezier(.23, 1, .32, 1)", fill: "forwards" },
    );
    animationRef.current.finished
      .then(() => finishDecision(decision, idea))
      .catch(() => {
        setBusy(false);
        resetCardStyles();
      })
      .finally(() => {
        animationRef.current = null;
      });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (busy || drag.current.active) return;
    drag.current = { active: true, pointerId: event.pointerId, startX: event.clientX, startAt: performance.now(), x: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId || !cardRef.current) return;
    const x = (event.clientX - drag.current.startX) * 0.86;
    drag.current.x = x;
    cardRef.current.style.transform = `translate3d(${x}px, 0, 0) rotate(${x / 25}deg)`;
    if (keepOverlayRef.current) keepOverlayRef.current.style.opacity = String(Math.min(Math.max(x / 88, 0), 1));
    if (passOverlayRef.current) passOverlayRef.current.style.opacity = String(Math.min(Math.max(-x / 88, 0), 1));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId || !cardRef.current) return;
    const elapsed = Math.max(performance.now() - drag.current.startAt, 1);
    const velocity = Math.abs(drag.current.x) / elapsed;
    const x = drag.current.x;
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(x) > 88 || velocity > 0.48) {
      decide(x > 0 ? "keep" : "pass");
      return;
    }

    animationRef.current = cardRef.current.animate(
      [{ transform: cardRef.current.style.transform }, { transform: "translate3d(0, 0, 0) rotate(0deg)" }],
      { duration: 190, easing: "cubic-bezier(.23, 1, .32, 1)" },
    );
    animationRef.current.finished.then(resetCardStyles).catch(resetCardStyles);
  }

  function handlePointerCancel() {
    drag.current.active = false;
    resetCardStyles();
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      decide("pass", false);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      decide("keep", false);
    }
  }

  function resetDeck() {
    animationRef.current?.cancel();
    animationRef.current = null;
    setIdeaIndex(0);
    setKept([]);
    setPassed(0);
    setAnnouncement("Deck reset. Swipe right to keep a hook, left to pass.");
    window.localStorage.removeItem("content-factory-swipe-v1");
    window.requestAnimationFrame(() => cardRef.current?.focus());
  }

  function createCarousel() {
    const chosen = kept[0];
    if (!chosen) return;
    const draft = buildCarouselDraft(profile, chosen.hook);
    const stored = window.localStorage.getItem("content-factory-draft-albums");
    let drafts: ContentAlbum[] = [];
    try {
      drafts = stored ? JSON.parse(stored) as ContentAlbum[] : [];
    } catch {
      drafts = [];
    }
    window.localStorage.setItem("content-factory-draft-albums", JSON.stringify([draft, ...drafts].slice(0, 8)));
    router.push("/albums?draft=1");
  }

  function chooseFormat(formatId: string) {
    setSelectedFormat(formatId);
    if (formatId === "carousel" && kept.length) createCarousel();
  }

  return (
    <div className="growth-studio">
      <a className="skip-link" href="#studio-main">Skip to studio</a>
      <header className="growth-header">
        <Link className="growth-wordmark" href="/" aria-label="Content Factory home">content factory<span>®</span></Link>
        <div className="growth-progress" aria-label="Workflow progress">
          <span className="is-done"><Check size={11} /> Discover</span><i />
          <span className="is-current">Brand studio</span><i />
          <span>Create</span>
        </div>
        <nav aria-label="Studio navigation">
          <Link href="/albums"><Layers3 size={15} aria-hidden="true" /> Albums</Link>
          <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> New app</Link>
        </nav>
      </header>

      <main id="studio-main" className="growth-main">
        <section className="identity-stage" aria-labelledby="identity-title">
          <div className="identity-heading">
            <span className="studio-eyebrow"><i /> Website understood</span>
            <h1 id="identity-title">Your app already has a story.<br /><em>Now it has a marketing system.</em></h1>
            <p>We pulled the identity, audience, promise, and language that should shape every piece of content.</p>
          </div>

          <div className="identity-board">
            <article className="identity-brand-card">
              <div className="brand-card-top">
                <div className="brand-logo-shell" style={{ backgroundColor: palette[0] }}>
                  {profile.logo && !logoFailed ? <img src={profile.logo} alt={`${profile.name} logo`} onError={() => setLogoFailed(true)} /> : <span>{profile.name.slice(0, 1)}</span>}
                </div>
                <div><small>BRAND FOUND</small><h2>{profile.name}</h2><a href={profile.url === "Founder brief" ? undefined : profile.url} target="_blank" rel="noreferrer">{profile.url.replace(/^https?:\/\//, "")}</a></div>
                <span className="identity-score">94%<small>signal match</small></span>
              </div>
              <p>{profile.description}</p>
              <div className="palette-strip" aria-label="Extracted brand palette">
                {palette.slice(0, 5).map((color, index) => <span key={`${color}-${index}`} style={{ backgroundColor: color }}><i>{color}</i></span>)}
              </div>
            </article>

            <article className="identity-positioning">
              <span>POSITIONING</span>
              <blockquote>“{profile.positioning}”</blockquote>
              <div>{profile.tone.slice(0, 3).map((tone) => <span key={tone}>+ {tone}</span>)}</div>
            </article>

            <article className="identity-audience">
              <span>WHO NEEDS THIS</span>
              <h3>{profile.audience[0]}</h3>
              <p>{profile.problem}</p>
            </article>

            <article className="identity-proof">
              <span>LANGUAGE WORTH KEEPING</span>
              <ul>{profile.evidence.slice(0, 3).map((item) => <li key={item}><Check size={13} aria-hidden="true" /> {item}</li>)}</ul>
            </article>
          </div>
        </section>

        <section className="hook-studio" aria-labelledby="hook-title">
          <div className="hook-heading">
            <span className="studio-eyebrow"><Sparkles size={13} aria-hidden="true" /> Generated from the brand, not a blank prompt</span>
            <h2 id="hook-title">Choose the hooks<br /><em>worth making.</em></h2>
            <p>Swipe right to save. Swipe left to pass. Every decision becomes part of the campaign brief.</p>
          </div>

          <div className="hook-workbench">
            <aside className="generation-stream" aria-label="Generated hooks">
              <div className="generation-head"><span><ScanSearch size={14} /> LIVE GENERATION</span><b>{String(visibleIdeas).padStart(2, "0")} / {String(ideas.length).padStart(2, "0")}</b></div>
              <ol>
                {ideas.map((idea, index) => (
                  <li key={idea.id} className={index < visibleIdeas ? "is-visible" : ""}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><small>{idea.angle}</small><p>{index < visibleIdeas ? idea.hook : "Finding another angle…"}</p></div>
                    {index < visibleIdeas ? <Check size={13} aria-hidden="true" /> : <span className="stream-loader" />}
                  </li>
                ))}
              </ol>
            </aside>

            <div className="real-swipe-stage">
              <div className="swipe-stage-meta"><span>{activeIdea ? `HOOK ${ideaIndex + 1} / ${ideas.length}` : "DECK COMPLETE"}</span><p><MousePointer2 size={13} /> drag or use arrow keys</p></div>
              <div className="real-card-stack">
                {activeIdea ? (
                  <>
                    {ideas[ideaIndex + 1] ? <div className="real-swipe-card card-ghost" aria-hidden="true" /> : null}
                    <div
                      ref={cardRef}
                      className="real-swipe-card"
                      style={{ borderTopColor: activeIdea.tint }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      onKeyDown={handleCardKeyDown}
                      role="group"
                      tabIndex={0}
                      aria-label={`Hook: ${activeIdea.hook}. Use left arrow to pass or right arrow to keep.`}
                    >
                      <div ref={keepOverlayRef} className="real-decision-overlay keep">KEEP</div>
                      <div ref={passOverlayRef} className="real-decision-overlay pass">PASS</div>
                      <div className="swipe-card-label"><span>{activeIdea.angle}</span><b>BRAND MATCH 9{ideaIndex + 3}%</b></div>
                      <h3>{activeIdea.hook}</h3>
                      <p>{activeIdea.why}</p>
                      <footer><span><i /> ready to test</span><small>content angle {String(ideaIndex + 1).padStart(2, "0")}</small></footer>
                    </div>
                  </>
                ) : visibleIdeas < ideas.length ? (
                  <div className="deck-waiting"><WandSparkles size={24} /><strong>Writing the next hook…</strong></div>
                ) : (
                  <div className="real-deck-complete">
                    <span><Check size={17} /> Selection saved</span>
                    <h3>{kept.length} hooks made the cut.</h3>
                    <p>Use one to build the first carousel, or run the deck again.</p>
                    <button ref={resetDeckRef} type="button" onClick={resetDeck}><RotateCcw size={15} /> Run again</button>
                  </div>
                )}
              </div>
              {activeIdea ? (
                <div className="real-swipe-actions">
                  <button type="button" onClick={() => decide("pass")} disabled={busy}><X size={18} /><span>Pass</span><kbd>←</kbd></button>
                  <button type="button" onClick={() => decide("keep")} disabled={busy}><Check size={18} /><span>Keep hook</span><kbd>→</kbd></button>
                </div>
              ) : null}
            </div>

            <aside className="kept-hooks">
              <div><span>YOUR SHORTLIST</span><b>{String(kept.length).padStart(2, "0")}</b></div>
              {kept.length ? (
                <ol>{kept.map((idea, index) => <li key={idea.id}><span>{index + 1}</span><p>{idea.hook}</p></li>)}</ol>
              ) : (
                <div className="kept-empty"><ArrowRight size={22} /><p>Hooks you keep land here and become your next campaign.</p></div>
              )}
              <footer><span>{passed} passed</span><button type="button" disabled={!kept.length} onClick={createCarousel}>Build carousel <ChevronRight size={15} /></button></footer>
            </aside>
          </div>
          <p className="sr-only" aria-live="polite">{announcement}</p>
        </section>

        <section className="format-launcher" aria-labelledby="format-title">
          <div>
            <span className="studio-eyebrow">YOUR BRAND BRAIN IS READY</span>
            <h2 id="format-title">What should we make first?</h2>
            <p>Start with carousels today. The same identity and hook decisions already adapt to every format.</p>
          </div>
          <div className="format-grid">
            {formats.map((format) => {
              const Icon = format.icon;
              const active = selectedFormat === format.id;
              return (
                <button key={format.id} type="button" className={active ? "is-selected" : ""} onClick={() => chooseFormat(format.id)}>
                  <Icon size={20} aria-hidden="true" />
                  <span><strong>{format.name}</strong><small>{format.detail}</small></span>
                  <b>{format.id === "carousel" ? (kept.length ? "BUILD" : "KEEP A HOOK") : "READY"}</b>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {selectedFormat !== "carousel" ? <div className="format-ready-note"><Check size={15} /> {formats.find((item) => item.id === selectedFormat)?.name} brief prepared from {profile.name}’s Brand Studio.</div> : null}
        </section>
      </main>
    </div>
  );
}
