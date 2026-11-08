"use client";

import dynamic from "next/dynamic";
import { ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, Box, Check, CircleHelp, Layers3, LoaderCircle, MoveUpRight, Pause, Play, Printer, Rotate3d, Sparkles, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "@/app/make/make.module.css";

const ProductPreview = dynamic(() => import("@/components/thing-product-preview"), {
  ssr: false,
  loading: () => <div className={styles.modelLoading}><LoaderCircle size={22} /><span>Setting up your workbench</span></div>,
});

const inspirations = [
  { id: "sandy", title: "Small fix. Big difference.", category: "Everyday upgrades", credit: "@sandymakes.ca", url: "https://www.tiktok.com/@sandymakes.ca/video/7619079101122383124?lang=en" },
  { id: "inventions", title: "A little less tangled.", category: "Clever little things", credit: "@af_inventions", url: "https://www.tiktok.com/@af_inventions/video/7668982523254410529?lang=en" },
  { id: "toylab", title: "Made for one more try.", category: "Just for the fun of it", credit: "@3dtoylab.official", url: "https://www.tiktok.com/@3dtoylab.official/video/7699322116931357983?lang=en" },
];

const templates = [
  { id: "spring", title: "A custom slinky", prompt: "A satisfying orange slinky with the YC logo on top. Something to keep my hands busy while I build.", label: "YC slinky", icon: Layers3 },
  { id: "buddy", title: "A desk buddy", prompt: "A playful little sculpture for my desk. Something I can pick up, turn around, and get lost in.", label: "The desk buddy", icon: Box },
  { id: "tag", title: "A logo keychain", prompt: "An orange keychain with a raised YC logo. Small enough for my pocket, big on personality.", label: "YC keychain", icon: Sparkles },
] as const;

const colors = [{ name: "Tangerine", value: "#fa612b" }, { name: "Cobalt", value: "#4165df" }, { name: "Matcha", value: "#92a875" }, { name: "Chalk", value: "#e8dfd0" }];

function ThingMark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 25 : 34} height={small ? 27 : 36} viewBox="0 0 34 36" fill="none" aria-hidden="true"><path d="M5 9c0-4 24-4 24 0S5 13 5 9Zm0 8c0-4 24-4 24 0S5 21 5 17Zm0 8c0-4 24-4 24 0S5 29 5 25Z" stroke="currentColor" strokeWidth="3.3" /><path d="M5 9v16m24-16v16" stroke="currentColor" strokeWidth="3.3" /></svg>;
}

function InspirationVideo({ item, index }: { item: typeof inspirations[number]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reducedMotion.matches && !document.hidden) video.play().catch(() => {});
      else video.pause();
    }, { threshold: .15 });
    observer.observe(video);
    const onVisibilityChange = () => { if (document.hidden) video.pause(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, []);

  return <article className={`${styles.videoCard} ${styles[`videoCard${index}`]}`}>
    <video ref={videoRef} src={`/make/${item.id}.mp4`} poster={`/make/${item.id}.jpg`} muted loop playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-label={item.title} />
    <div className={styles.videoShade} />
    <span className={styles.videoCategory}>{item.category}</span>
    <button className={styles.videoPlay} type="button" aria-label={`${playing ? "Pause" : "Play"} ${item.category} video`} onClick={() => {
      const video = videoRef.current;
      if (video) { if (video.paused) video.play().catch(() => {}); else video.pause(); }
    }}>{playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</button>
    <div className={styles.videoCaption}><strong>{item.title}</strong><a href={item.url} target="_blank" rel="noreferrer">{item.credit}<ArrowUpRight size={11} /></a></div>
  </article>;
}

export function ThingStudio() {
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState<(typeof templates)[number]>(templates[0]);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState("Palm-sized");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    if (!showPrint && !showHelp) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setShowPrint(false); setShowHelp(false); }
      if (event.key === "Tab") {
        const buttons = modalRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, [showPrint, showHelp]);

  function chooseTemplate(next: (typeof templates)[number]) {
    setTemplate(next);
    setPrompt(next.prompt);
    setGenerated(false);
  }

  function makePreview(event: FormEvent) {
    event.preventDefault();
    if (generating) return;
    if (!prompt.trim()) setPrompt(template.prompt);
    setGenerating(true);
    timerRef.current = setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      previewRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
    }, 1200);
  }

  return <div className={styles.page}>
    <a className={styles.skipLink} href="#idea">Skip to your idea</a>
    <header className={styles.header}>
      <a className={styles.wordmark} href="/make" aria-label="thing home"><ThingMark /><span>thing.</span></a>
      <nav className={styles.navigation} aria-label="Main navigation"><a href="#how">How it works <ArrowUpRight size={13} /></a><button type="button" onClick={() => promptRef.current?.focus()}>Start making <ArrowUpRight size={16} /></button></nav>
    </header>

    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby="thing-title">
        <div className={styles.heroTopline}><span><i /> YOUR IDEA. MADE REAL.</span><span className={styles.edition}>THE MAKE-IT-YOURS MACHINE <MoveUpRight size={13} /></span></div>
        <div className={styles.heroHeading}><h1 id="thing-title">Think it. <em>Make it.</em></h1><div className={styles.heroAside}><p>Your idea. Designed, printed, yours.</p><span>From a prompt to your next favorite thing. <ArrowDownLeft size={22} strokeWidth={1.4} /></span></div></div>
      </section>

      <div className={styles.workbench}>
        <div className={styles.ideaColumn}>
          <section className={styles.inspiration} aria-labelledby="inspiration-heading">
            <div className={styles.sectionLabel}><h2 id="inspiration-heading">A little inspiration.</h2><span><VolumeX size={12} /> SOUND OFF. IDEAS ON.</span></div>
            <div className={styles.videos}>{inspirations.map((item, index) => <InspirationVideo item={item} index={index} key={item.id} />)}</div>
            <div className={styles.inspirationFootnote}><span>SMALL IDEAS. REAL OBJECTS.</span><span>Now, your turn <ArrowDown size={12} /></span></div>
          </section>

          <section className={styles.composerSection} id="idea" aria-labelledby="idea-heading">
            <div className={styles.ideaHeading}><h2 id="idea-heading">What would you love to make?</h2><span>01 / IMAGINE</span></div>
            <form className={`${styles.composer} ${generating ? styles.composerBusy : ""}`} onSubmit={makePreview}>
              <label htmlFor="thing-prompt" className={styles.srOnly}>Describe what you would love to make</label>
              <textarea ref={promptRef} id="thing-prompt" value={prompt} onChange={(event) => { setPrompt(event.target.value); setGenerated(false); }} placeholder="A slinky with my logo. A home for my headphones. Something nobody's made yet..." maxLength={700} rows={3} />
              <div className={styles.composerToolbar}><button className={styles.makeButton} type="submit" disabled={generating}>{generating ? <><LoaderCircle size={18} className={styles.spin} /> Shaping your idea</> : <>Make it real <ArrowUpRight className={styles.makeArrow} size={27} /></>}</button></div>
            </form>
            <div className={styles.templates}><span>OR START WITH</span><div>{templates.map((item) => <button key={item.id} type="button" aria-pressed={prompt === item.prompt} onClick={() => chooseTemplate(item)}><item.icon size={14} />{item.title}<ArrowUpRight size={12} /></button>)}</div></div>
            <div className={styles.composerNote}><Sparkles size={13} /><span>No CAD. No learning curve. Just a little imagination.</span></div>
          </section>
        </div>

        <section className={styles.previewPanel} ref={previewRef} aria-labelledby="preview-heading">
          <div className={styles.previewTop}><span><i /> YOUR IDEA, TAKING SHAPE</span><button type="button" onClick={() => setShowHelp(true)} aria-label="About this 3D preview"><CircleHelp size={17} /></button></div>
          <div className={styles.previewStage}>
            <div className={styles.stageGrid} aria-hidden="true" />
            <div className={styles.previewTag}><span>{generated ? <Check size={12} /> : <Box size={12} />}{generated ? "PREVIEW READY" : "TRY A LITTLE WHAT-IF"}</span><small>3D / {template.id === "spring" ? "001" : template.id === "buddy" ? "002" : "003"}</small></div>
            <ProductPreview kind={template.id} color={color.value} logo={null} />
            <span className={styles.modelAnnotation}><i />{template.id === "spring" ? "A little bounce. A lot of you." : template.id === "buddy" ? "For thinking with your hands." : "Your logo. Going places."}</span>
            <div className={styles.stageBottom}><span><Rotate3d size={15} /> Drag to give it a spin</span><span>100% YOU</span></div>
            {generating ? <div className={styles.generatingOverlay}><LoaderCircle className={styles.spin} size={24} /><span>A little imagination in progress...</span></div> : null}
          </div>
          <div className={styles.previewDetails}>
            <div className={styles.productHeading}><div><span>YOUR NEXT FAVORITE THING</span><h2 id="preview-heading">{template.label}<ArrowUpRight size={22} strokeWidth={1.6} /></h2></div><span className={styles.materialBadge}>PLA / MATTE</span></div>
            <div className={styles.productOptions}><div className={styles.colorOption}><span>MAKE IT YOUR COLOR</span><div>{colors.map((item) => <button type="button" key={item.name} className={color.name === item.name ? styles.selectedColor : ""} style={{ "--swatch": item.value } as React.CSSProperties} aria-label={item.name} aria-pressed={color.name === item.name} onClick={() => setColor(item)}>{color.name === item.name ? <Check size={12} strokeWidth={2.5} /> : null}</button>)}<small>{color.name}</small></div></div><label className={styles.sizeOption}>A LITTLE OR A LOT?<select aria-label="Product size" value={size} onChange={(event) => setSize(event.target.value)}><option>Palm-sized</option><option>Pocket-sized</option><option>Desk-sized</option></select></label></div>
            <button className={styles.printButton} type="button" onClick={() => setShowPrint(true)}><span><Printer size={17} /> Let&apos;s print this thing</span><ArrowRight size={18} /></button>
            <div className={styles.previewNote}><span>Designed by you. Made in the real world.</span><span>DESIGN PREVIEW</span></div>
          </div>
        </section>
      </div>

      <section className={styles.how} id="how" aria-labelledby="how-heading"><div className={styles.howTitle}><span>FROM &quot;WHAT IF&quot; TO &quot;LOOK AT THIS&quot;</span><h2 id="how-heading">Less figuring it out.<br />More making it yours.</h2></div><div className={styles.howSteps}><article><span>01</span><h3>Tell us your thing.</h3><p>A wild idea, a tiny fix, a logo you love. Start anywhere.</p></article><article><span>02</span><h3>Find your kind of perfect.</h3><p>Play with the shape, color, and details. It&apos;s your call.</p></article><article><span>03</span><h3>Meet it in real life.</h3><p>Your design goes to a 3D printer. Your idea gets a life.</p></article></div></section>
      <footer className={styles.footer}><a href="/make" className={styles.footerLogo}><ThingMark small /> thing.</a><span>A little less scrolling. A little more making.</span><span>BUILT AT NAÏVE × YC <ArrowUpRight size={12} /></span></footer>
    </main>

    {showPrint || showHelp ? <div className={styles.modalBackdrop} onClick={() => { setShowPrint(false); setShowHelp(false); }}><section ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="thing-modal-heading" onClick={(event) => event.stopPropagation()}><button className={styles.closeModal} type="button" autoFocus aria-label="Close preview dialog" onClick={() => { setShowPrint(false); setShowHelp(false); }}><X size={20} /></button><div className={styles.modalIcon}>{showPrint ? <Printer size={30} /> : <Rotate3d size={30} />}</div><span className={styles.modalEyebrow}>A LITTLE LOOK AHEAD</span><h2 id="thing-modal-heading">{showPrint ? "Next stop: the real world." : "Go on. Give it a spin."}</h2><p>{showPrint ? "This is the design demo. Your personalized model, print settings, and connected Bambu Lab printer will come together here." : "Drag the model to see it from every angle. Try a template or pick your color to make the sample yours. AI generation and printer connection come next."}</p>{showPrint ? <div className={styles.printSummary}><span>{template.label}<small>{color.name} · {size} · Matte PLA</small></span><Printer size={20} /></div> : null}<button type="button" className={styles.modalAction} onClick={() => { setShowPrint(false); setShowHelp(false); }}>Keep making <ArrowRight size={16} /></button></section></div> : null}
  </div>;
}
