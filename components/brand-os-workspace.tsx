"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  FilePenLine,
  Layers3,
  MousePointer2,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { contentFactoryProfile, type BrandProfile } from "@/lib/brand-profile";

type Decision = "keep" | "pass";
type LabMode = "blitz" | "manual";

type SwipeIdea = {
  id: string;
  angle: string;
  hook: string;
  format: string;
  channel: string;
  why: string;
  tint: string;
};

const demoHooks = [
  "your app isn’t invisible—your positioning is",
  "building the app got easy; getting it seen didn’t",
  "one website in, a campaign system out",
  "stop prompting; start shipping",
  "distribution is a product problem too",
];

const ideaFormats = ["7-slide story", "Hook + demo", "Founder POV", "Wall of text", "Voiceover reel"];
const ideaChannels = ["Instagram", "TikTok", "LinkedIn", "TikTok", "Reels"];
const ideaTints = ["#f29c8f", "#c8ff5c", "#8b8fff", "#ffd36c", "#9ad8c6"];

function createIdeas(profile: BrandProfile): SwipeIdea[] {
  return profile.contentAngles.slice(0, 5).map((angle, index) => ({
    id: `${profile.name}-${index}`,
    angle,
    hook: profile.name === "Content Factory" ? demoHooks[index] : angle.toLowerCase(),
    format: ideaFormats[index],
    channel: ideaChannels[index],
    why: index === 0 ? `Leads with the audience’s felt problem before introducing ${profile.name}.` : `Turns a discovered brand signal into a native, testable story.`,
    tint: ideaTints[index],
  }));
}

function EditableTextCard({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    const nextValue = draft.trim();
    if (nextValue) onSave(nextValue);
    setEditing(false);
  }

  return (
    <article className="dna-card editable-dna-card">
      <div className="dna-card-heading">
        <span>{label}</span>
        <button type="button" onClick={() => {
          if (editing) save();
          else {
            setDraft(value);
            setEditing(true);
          }
        }} aria-expanded={editing}>
          {editing ? <><Check size={13} aria-hidden="true" /> Save</> : <><FilePenLine size={13} aria-hidden="true" /> Edit</>}
        </button>
      </div>
      {editing ? (
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={`Edit ${label}`} autoFocus />
      ) : (
        <p>{value}</p>
      )}
    </article>
  );
}

export function BrandOsWorkspace() {
  const [profile, setProfile] = useState<BrandProfile>(contentFactoryProfile);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<LabMode>("blitz");
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [kept, setKept] = useState<SwipeIdea[]>([]);
  const [passed, setPassed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("Swipe right to keep an idea, left to pass.");
  const [manualGoal, setManualGoal] = useState("Build awareness");
  const [manualFormat, setManualFormat] = useState("Founder story");
  const [manualNote, setManualNote] = useState("");
  const [manualDraftReady, setManualDraftReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const keepOverlayRef = useRef<HTMLDivElement>(null);
  const passOverlayRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, pointerId: -1, startX: 0, startAt: 0, x: 0 });

  useEffect(() => {
    const loadProfile = window.setTimeout(() => {
      const stored = window.sessionStorage.getItem("content-factory-profile");
      if (stored) {
        try {
          setProfile(JSON.parse(stored) as BrandProfile);
        } catch {
          window.sessionStorage.removeItem("content-factory-profile");
        }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(loadProfile);
  }, []);

  useEffect(() => {
    if (hydrated) window.sessionStorage.setItem("content-factory-profile", JSON.stringify(profile));
  }, [hydrated, profile]);

  const ideas = useMemo(() => createIdeas(profile), [profile]);
  const activeIdea = ideas[ideaIndex];

  function updateProfile(field: "positioning" | "problem" | "mission", value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function resetCardStyles() {
    if (cardRef.current) {
      cardRef.current.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
      cardRef.current.style.opacity = "1";
    }
    if (keepOverlayRef.current) keepOverlayRef.current.style.opacity = "0";
    if (passOverlayRef.current) passOverlayRef.current.style.opacity = "0";
  }

  function finishDecision(decision: Decision, idea: SwipeIdea) {
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
      cardRef.current?.focus();
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
    const startingTransform = card.style.transform || "translate3d(0, 0, 0) rotate(0deg)";
    card
      .animate(
        [
          { transform: startingTransform, opacity: 1 },
          { transform: `translate3d(${direction * 620}px, -14px, 0) rotate(${direction * 16}deg)`, opacity: 0 },
        ],
        { duration: 220, easing: "cubic-bezier(.23, 1, .32, 1)", fill: "forwards" },
      )
      .finished.then(() => finishDecision(decision, idea));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (busy) return;
    drag.current = { active: true, pointerId: event.pointerId, startX: event.clientX, startAt: performance.now(), x: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.transition = "none";
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId || !cardRef.current) return;
    const x = event.clientX - drag.current.startX;
    drag.current.x = x;
    cardRef.current.style.transform = `translate3d(${x}px, 0, 0) rotate(${x / 24}deg)`;
    if (keepOverlayRef.current) keepOverlayRef.current.style.opacity = String(Math.min(Math.max(x / 90, 0), 1));
    if (passOverlayRef.current) passOverlayRef.current.style.opacity = String(Math.min(Math.max(-x / 90, 0), 1));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId || !cardRef.current) return;
    const elapsed = Math.max(performance.now() - drag.current.startAt, 1);
    const velocity = Math.abs(drag.current.x) / elapsed;
    const x = drag.current.x;
    drag.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(x) > 92 || velocity > 0.55) {
      decide(x > 0 ? "keep" : "pass");
      return;
    }

    const startingTransform = cardRef.current.style.transform;
    cardRef.current
      .animate(
        [{ transform: startingTransform }, { transform: "translate3d(0, 0, 0) rotate(0deg)" }],
        { duration: 190, easing: "cubic-bezier(.23, 1, .32, 1)" },
      )
      .finished.then(resetCardStyles);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      decide("pass", false);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      decide("keep", false);
    }
  }

  function resetDeck() {
    setIdeaIndex(0);
    setKept([]);
    setPassed(0);
    setAnnouncement("Deck reset. Swipe right to keep an idea, left to pass.");
  }

  function buildManualDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualDraftReady(true);
  }

  return (
    <div className="brand-os-page">
      <a className="skip-link" href="#brand-os-main">Skip to Brand OS</a>
      <header className="workspace-header">
        <Link className="workspace-wordmark" href="/" aria-label="Content Factory home">
          content factory<span>®</span>
        </Link>
        <div className="workspace-breadcrumb"><span>Workspace</span><i>/</i><strong>{profile.name}</strong></div>
        <div className="workspace-header-status"><i /><span>Brand OS ready</span></div>
        <Link className="workspace-exit" href="/"><ArrowLeft size={16} aria-hidden="true" /> New discovery</Link>
      </header>

      <div className="workspace-shell">
        <aside className="workspace-sidebar" aria-label="Workspace sections">
          <div className="workspace-app-mark" style={{ backgroundColor: profile.themeColor || "#c8ff5c" }}>
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <nav>
            <a href="#overview" aria-current="page"><CircleDot size={16} aria-hidden="true" /><span>Overview</span><b>01</b></a>
            <a href="#brand-dna"><Layers3 size={16} aria-hidden="true" /><span>Brand DNA</span><b>02</b></a>
            <a href="#launch-lab"><Zap size={16} aria-hidden="true" /><span>Launch lab</span><b>03</b></a>
          </nav>
          <div className="workspace-sidebar-note">
            <Sparkles size={15} aria-hidden="true" />
            <p><strong>{profile.signals.length} signals</strong> mapped from {profile.url === "Founder brief" ? "your brief" : "the website"}.</p>
          </div>
        </aside>

        <main id="brand-os-main" className="workspace-main">
          <section className="brand-os-hero" id="overview">
            <div className="brand-os-intro">
              <span className="workspace-eyebrow">01 / DISCOVERED PRODUCT TRUTH</span>
              <h1>We found what makes<br /><em>{profile.name}</em> worth noticing.</h1>
              <p>{profile.description}</p>
              <div className="evidence-strip" aria-label="Evidence found">
                {profile.evidence.map((item) => <span key={item}><Check size={12} aria-hidden="true" /> {item}</span>)}
              </div>
            </div>
            <div className="signal-map" aria-label="Brand signal map">
              <div className="signal-map-label"><span>Brand signal map</span><b>Live brief</b></div>
              <div className="signal-orbit">
                <i className="orbit orbit-one" /><i className="orbit orbit-two" />
                <div className="signal-core" style={{ backgroundColor: profile.themeColor || "#c8ff5c" }}>{profile.name.slice(0, 1)}</div>
                <span className="signal-node node-a">Audience</span>
                <span className="signal-node node-b">Problem</span>
                <span className="signal-node node-c">Voice</span>
                <span className="signal-node node-d">Proof</span>
              </div>
              <footer><span>Source</span><strong>{profile.url.replace(/^https?:\/\//, "")}</strong></footer>
            </div>
          </section>

          <section className="brand-dna-section" id="brand-dna">
            <div className="workspace-section-title">
              <div><span className="workspace-eyebrow">02 / BRAND OS</span><h2>Your editable source of truth.</h2></div>
              <p>Every idea and campaign downstream uses this context—not a blank prompt.</p>
            </div>
            <div className="dna-grid">
              <EditableTextCard label="Positioning" value={profile.positioning} onSave={(value) => updateProfile("positioning", value)} />
              <EditableTextCard label="Problem solved" value={profile.problem} onSave={(value) => updateProfile("problem", value)} />
              <EditableTextCard label="Mission" value={profile.mission} onSave={(value) => updateProfile("mission", value)} />
              <article className="dna-card dna-list-card">
                <div className="dna-card-heading"><span>Audience</span><b>{profile.audience.length} segments</b></div>
                <ul>{profile.audience.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article className="dna-card dna-list-card">
                <div className="dna-card-heading"><span>Reasons to believe</span><b>{profile.benefits.length} proofs</b></div>
                <ul>{profile.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article className="dna-card voice-card">
                <div className="dna-card-heading"><span>Voice guardrails</span><b>Applied globally</b></div>
                <div><strong>Do</strong>{profile.tone.map((item) => <span key={item}>+ {item}</span>)}</div>
                <div><strong>Avoid</strong>{profile.avoid.map((item) => <span key={item}>− {item}</span>)}</div>
              </article>
            </div>
          </section>

          <section className="launch-lab" id="launch-lab">
            <div className="workspace-section-title launch-title">
              <div><span className="workspace-eyebrow">03 / LAUNCH LAB</span><h2>Choose the work worth making.</h2></div>
              <div className="lab-mode-tabs" role="tablist" aria-label="Content creation mode">
                <button type="button" role="tab" aria-selected={mode === "blitz"} onClick={() => setMode("blitz")}><MousePointer2 size={15} aria-hidden="true" /> Blitz</button>
                <button type="button" role="tab" aria-selected={mode === "manual"} onClick={() => setMode("manual")}><FilePenLine size={15} aria-hidden="true" /> Manual</button>
              </div>
            </div>

            {mode === "blitz" ? (
              <div className="swipe-lab">
                <div className="swipe-stage">
                  <div className="swipe-stage-heading">
                    <div><span>IDEA {Math.min(ideaIndex + 1, ideas.length)} / {ideas.length}</span><strong>Swipe the launch deck</strong></div>
                    <p>Right to keep · Left to pass</p>
                  </div>
                  <div className="card-stack">
                    {activeIdea ? (
                      <>
                        {ideas[ideaIndex + 1] ? <div className="swipe-card card-behind" aria-hidden="true" /> : null}
                        <div
                          ref={cardRef}
                          className="swipe-card active-swipe-card"
                          style={{ borderTopColor: activeIdea.tint }}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                          onKeyDown={handleCardKeyDown}
                          role="group"
                          aria-label={`Content idea: ${activeIdea.hook}. Use left arrow to pass or right arrow to keep.`}
                          tabIndex={0}
                        >
                          <div ref={keepOverlayRef} className="decision-overlay keep-overlay">KEEP</div>
                          <div ref={passOverlayRef} className="decision-overlay pass-overlay">PASS</div>
                          <div className="idea-meta"><span>{activeIdea.format}</span><span>{activeIdea.channel}</span></div>
                          <span className="idea-angle">Angle / {activeIdea.angle}</span>
                          <h3>{activeIdea.hook}</h3>
                          <p>{activeIdea.why}</p>
                          <footer><span>Brand-matched</span><b><i /> Ready to test</b></footer>
                        </div>
                      </>
                    ) : (
                      <div className="deck-complete">
                        <span><Check size={18} aria-hidden="true" /> Deck sorted</span>
                        <h3>{kept.length} ideas made the cut.</h3>
                        <p>Your approved ideas are ready to become a launch campaign.</p>
                        <button type="button" onClick={resetDeck}><RotateCcw size={15} aria-hidden="true" /> Run the deck again</button>
                      </div>
                    )}
                  </div>
                  {activeIdea ? (
                    <div className="swipe-actions">
                      <button type="button" className="pass-action" onClick={() => decide("pass")} disabled={busy}><X size={19} aria-hidden="true" /><span>Pass</span><kbd>←</kbd></button>
                      <button type="button" className="keep-action" onClick={() => decide("keep")} disabled={busy}><Check size={19} aria-hidden="true" /><span>Keep idea</span><kbd>→</kbd></button>
                    </div>
                  ) : null}
                </div>

                <aside className="approved-queue">
                  <div className="queue-heading"><span>Approved queue</span><b>{kept.length.toString().padStart(2, "0")}</b></div>
                  {kept.length ? (
                    <ol>{kept.map((idea, index) => <li key={idea.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{idea.hook}</strong><small>{idea.format} · {idea.channel}</small></div></li>)}</ol>
                  ) : (
                    <div className="queue-empty"><ArrowDownRight size={24} aria-hidden="true" /><p>Ideas you keep land here, ready for campaign production.</p></div>
                  )}
                  <footer><span>{passed} passed</span><button type="button" disabled={!kept.length}>Build campaign <ArrowRight size={15} aria-hidden="true" /></button></footer>
                </aside>
                <p className="sr-only" aria-live="polite">{announcement}</p>
              </div>
            ) : (
              <div className="manual-lab">
                <form onSubmit={buildManualDraft}>
                  <div className="manual-form-heading"><span>Manual creation</span><strong>Start with intent, not a blank prompt.</strong></div>
                  <label>Goal<select value={manualGoal} onChange={(event) => { setManualGoal(event.target.value); setManualDraftReady(false); }}><option>Build awareness</option><option>Explain the product</option><option>Drive signups</option></select></label>
                  <label>Format<select value={manualFormat} onChange={(event) => { setManualFormat(event.target.value); setManualDraftReady(false); }}><option>Founder story</option><option>Hook + demo</option><option>Carousel</option><option>Wall of text</option></select></label>
                  <label className="manual-brief">What should this piece say?<textarea value={manualNote} onChange={(event) => { setManualNote(event.target.value); setManualDraftReady(false); }} placeholder={`Try: explain why ${profile.name} exists without sounding like an ad.`} /></label>
                  <button type="submit"><Sparkles size={16} aria-hidden="true" /> Draft content</button>
                </form>
                <div className={`manual-preview ${manualDraftReady ? "is-ready" : ""}`}>
                  <span>{manualDraftReady ? "Draft ready" : "Live preview"}</span>
                  <div className="manual-preview-canvas">
                    <small>{manualFormat} / {manualGoal}</small>
                    <h3>{manualNote.trim() || profile.contentAngles[0]}</h3>
                    <p>{manualDraftReady ? `Built from ${profile.name}’s positioning, audience, and voice guardrails.` : "Add a direction, then draft a brand-matched first version."}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
