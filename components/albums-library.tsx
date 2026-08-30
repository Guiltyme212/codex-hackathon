"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, GalleryHorizontalEnd, ImagePlus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { carouselRules, seededAlbums, type ContentAlbum } from "@/lib/albums";

export function AlbumsLibrary() {
  const [albums, setAlbums] = useState<ContentAlbum[]>(seededAlbums);
  const [selectedId, setSelectedId] = useState(seededAlbums[0].id);
  const [slideIndex, setSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [promptsReady, setPromptsReady] = useState(false);

  useEffect(() => {
    const loadDrafts = window.setTimeout(() => {
      const stored = window.localStorage.getItem("content-factory-draft-albums");
      if (!stored) return;
      try {
        const drafts = JSON.parse(stored) as ContentAlbum[];
        if (!drafts.length) return;
        setAlbums([...drafts, ...seededAlbums]);
        if (new URLSearchParams(window.location.search).get("draft") === "1") setSelectedId(drafts[0].id);
      } catch {
        window.localStorage.removeItem("content-factory-draft-albums");
      }
    }, 0);
    return () => window.clearTimeout(loadDrafts);
  }, []);

  const selected = albums.find((album) => album.id === selectedId) ?? albums[0];
  const activeSlide = selected.slides[slideIndex] ?? selected.slides[0];

  function chooseAlbum(album: ContentAlbum) {
    setSelectedId(album.id);
    setSlideIndex(0);
    setCopied(false);
    setPromptsReady(false);
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(selected.caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function moveSlide(direction: -1 | 1) {
    setSlideIndex((current) => (current + direction + selected.slides.length) % selected.slides.length);
  }

  return (
    <div className="albums-page">
      <header className="albums-header">
        <Link className="growth-wordmark" href="/">content factory<span>®</span></Link>
        <div><span>ALBUMS</span><i>/</i><strong>{albums.length} campaigns</strong></div>
        <nav><Link href="/workspace"><ArrowLeft size={15} /> Brand studio</Link><Link href="/"><Sparkles size={15} /> Discover app</Link></nav>
      </header>

      <main className="albums-main">
        <section className="albums-intro">
          <span className="studio-eyebrow"><i /> The work, organized</span>
          <h1>Campaigns you can<br /><em>actually ship.</em></h1>
          <p>Every Album keeps the hook, slide order, visuals, and caption together—ready for TikTok photo mode or Instagram.</p>
          <div><span>{carouselRules.slideCount} slides</span><span>≤ {carouselRules.maxWordsPerSlide} words each</span><span>soft CTA</span></div>
        </section>

        <section className="album-shelf" aria-label="Campaign albums">
          {albums.map((album) => {
            const cover = album.slides[0]?.image;
            return (
              <button key={album.id} type="button" className={album.id === selected.id ? "is-selected" : ""} onClick={() => chooseAlbum(album)}>
                <div className="album-cover" style={{ backgroundColor: album.accent }}>
                  {cover ? <Image src={cover} alt="" fill sizes="220px" /> : <div className="draft-cover"><span>{album.brand}</span><strong>{album.title}</strong></div>}
                  <i>{album.slides.length}</i>
                </div>
                <span><small>{album.status} / {album.format}</small><strong>{album.title}</strong></span>
              </button>
            );
          })}
        </section>

        <section className="album-workspace" aria-label={`${selected.title} album`}>
          <div className="album-workspace-head">
            <div><span>{selected.brand} / {selected.status}</span><h2>{selected.title}</h2></div>
            <div><span>{String(slideIndex + 1).padStart(2, "0")}</span><i>/</i><b>{String(selected.slides.length).padStart(2, "0")}</b></div>
          </div>

          <div className="album-editor">
            <aside className="slide-rail" aria-label="Slides">
              {selected.slides.map((slide, index) => (
                <button key={slide.id} type="button" className={index === slideIndex ? "is-active" : ""} onClick={() => setSlideIndex(index)} aria-label={`Open slide ${index + 1}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div style={{ backgroundColor: selected.accent }}>
                    {slide.image ? <Image src={slide.image} alt="" fill sizes="80px" /> : <p>{slide.copy}</p>}
                  </div>
                </button>
              ))}
            </aside>

            <div className="slide-preview-wrap">
              <div className="slide-preview" style={{ backgroundColor: selected.accent }}>
                {activeSlide.image ? (
                  <Image src={activeSlide.image} alt={activeSlide.copy} fill priority sizes="(max-width: 760px) 82vw, 430px" />
                ) : (
                  <div className="generated-draft-slide">
                    <span>{selected.brand} / {activeSlide.role}</span>
                    <h3>{activeSlide.copy}</h3>
                    <small>Visual prompt ready</small>
                  </div>
                )}
              </div>
              <div className="slide-controls">
                <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous slide"><ChevronLeft size={18} /></button>
                <span>Slide {slideIndex + 1} of {selected.slides.length}</span>
                <button type="button" onClick={() => moveSlide(1)} aria-label="Next slide"><ChevronRight size={18} /></button>
              </div>
            </div>

            <aside className="album-inspector">
              <div className="inspector-block">
                <span>SLIDE ROLE</span>
                <strong>{activeSlide.role}</strong>
                <p>{activeSlide.copy}</p>
              </div>
              <div className="inspector-block structure">
                <span>STORY STRUCTURE</span>
                <ol>{carouselRules.structure.map((item, index) => <li key={item} className={index === slideIndex ? "is-current" : ""}><span>{index + 1}</span>{item}{index < slideIndex ? <Check size={12} /> : null}</li>)}</ol>
              </div>
              <div className="caption-block">
                <div><span>CAPTION</span><button type="button" onClick={copyCaption}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button></div>
                <p>{selected.caption}</p>
              </div>
              {selected.status === "Draft" ? (
                <button className="visual-generation-cta" type="button" onClick={() => setPromptsReady(true)}>
                  {promptsReady ? <Check size={17} /> : <ImagePlus size={17} />}
                  <span>
                    <strong>{promptsReady ? "7 visual prompts ready" : "Prepare visual prompts"}</strong>
                    <small>{promptsReady ? "Add an image key to render" : "One prompt per slide"}</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="album-ready-state"><Check size={16} /><span><strong>Ready to post</strong><small>7 ordered JPEG slides</small></span></div>
              )}
            </aside>
          </div>
        </section>

        <section className="album-bottom-cta">
          <div><GalleryHorizontalEnd size={22} /><span><strong>Start another campaign</strong><small>Return to the hooks your Brand Studio generated.</small></span></div>
          <Link href="/workspace">Choose another hook <ChevronRight size={16} /></Link>
        </section>
      </main>
    </div>
  );
}
