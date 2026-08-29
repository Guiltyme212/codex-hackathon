import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, ChevronRight, Layers3, Sparkles } from "lucide-react";
import { DiscoveryDemo } from "@/components/discovery-demo";

const deliverables = [
  ["01", "Brand profile", "Positioning, proof points, audience, voice, and visual signals."],
  ["02", "Content angles", "Hooks grounded in what the product actually does and who needs it."],
  ["03", "Campaign system", "Carousels, short-form scripts, variants, approvals, and a learning loop."],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <main id="main-content">
      <header className="site-header">
        <Link className="wordmark" href="#top" aria-label="Content Factory home">
          content<br />factory<span>®</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="#product">Product</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#demo">Live demo</Link>
        </nav>
        <Link className="header-cta" href="#demo">
          Open the factory <ArrowDownRight aria-hidden="true" size={18} />
        </Link>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="status-dot" /> The growth system for app founders
          </div>
          <h1>
            Building the app got easy.<br />
            <span className="hero-contrast">Getting it seen didn&apos;t.</span>
          </h1>
          <p className="hero-lede">
            Content Factory learns your product, finds the angles people care about, and turns them
            into campaigns you can approve as quickly as you built the app.
          </p>
          <DiscoveryDemo />
        </div>

        <div className="hero-visual" aria-label="Content Factory campaign preview">
          <div className="visual-label">OUTPUT / CAROUSEL 02</div>
          <div className="poster poster-back">
            <Image src="/demo/content-factory-03.jpg" alt="Content Factory carousel slide: Stop prompting. Start shipping." fill loading="eager" sizes="(max-width: 800px) 55vw, 25vw" />
          </div>
          <div className="poster poster-middle">
            <Image src="/demo/content-factory-02.jpg" alt="Content Factory carousel slide: One website in. A campaign system out." fill loading="eager" sizes="(max-width: 800px) 55vw, 25vw" />
          </div>
          <div className="poster poster-front">
            <Image src="/demo/content-factory-01.jpg" alt="Content Factory carousel slide: Your app isn’t invisible. Your positioning is." fill priority sizes="(max-width: 800px) 55vw, 25vw" />
          </div>
          <div className="angle-note">
            <Sparkles size={16} aria-hidden="true" />
            <span>Angle found</span>
            <strong>distribution without guesswork</strong>
          </div>
        </div>
      </section>

      <div className="ticker" aria-label="Content Factory capabilities">
        <div>
          <span>ONE WEBSITE</span><i>→</i><span>BRAND DNA</span><i>→</i><span>CONTENT ANGLES</span><i>→</i><span>CAMPAIGNS</span><i>→</i><span>LEARNING LOOP</span>
        </div>
      </div>

      <section className="deliverables" id="product">
        <div className="deliverables-intro">
          <span className="section-number">01 / BUILD</span>
          <h2>From scattered context to a repeatable content system.</h2>
          <Link href="#demo">See the system in action <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="deliverables-list">
          {deliverables.map(([number, title, body]) => (
            <article key={number} className="deliverable-row">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <ChevronRight aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="studio-preview" id="how-it-works">
        <div className="studio-title">
          <span className="section-number">02 / SHIP</span>
          <h2>A working campaign studio.<br /><em>Not another prompt box.</em></h2>
        </div>
        <div className="studio-window">
          <div className="window-bar">
            <div className="window-brand"><Layers3 size={17} aria-hidden="true" /> Content Factory / Launch engine</div>
            <div className="window-tabs"><span className="active">Board</span><span>Assets</span><span>Learnings</span></div>
            <span className="batch-status"><Check size={15} aria-hidden="true" /> Batch generated</span>
          </div>
          <div className="campaign-grid">
            <div className="campaign-sidebar">
              <p>THIS WEEK</p>
              <strong>3 campaigns</strong>
              <span>14 assets ready</span>
              <div className="mini-meter"><i /></div>
              <small>Content mix health</small>
            </div>
            <div className="campaign-card warm">
              <div><span>VALIDATION</span><b>7 slides</b></div>
              <h3>your app isn&apos;t invisible. your positioning is.</h3>
              <div className="mini-slides">
                {[1, 2, 3].map((index) => <Image key={index} src={`/demo/content-factory-0${index}.jpg`} alt="" width={90} height={135} />)}
              </div>
              <footer><span>Ready to review</span><ArrowRight size={17} aria-hidden="true" /></footer>
            </div>
            <div className="campaign-card blue">
              <div><span>EDUCATIONAL</span><b>Script</b></div>
              <h3>one website in. a campaign system out.</h3>
              <p>Hook variations <strong>08</strong></p>
              <p>Voice match <strong>94%</strong></p>
              <footer><span>Draft generated</span><ArrowRight size={17} aria-hidden="true" /></footer>
            </div>
            <div className="campaign-card acid">
              <div><span>LEARNING</span><b>Live</b></div>
              <h3>Stop prompting. Start shipping.</h3>
              <div className="signal-bars"><i /><i /><i /><i /><i /></div>
              <footer><span>Apply insight</span><ArrowRight size={17} aria-hidden="true" /></footer>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <p>The build is done. Distribution starts here.</p>
        <h2>Make your product<br /><em>impossible to ignore.</em></h2>
        <Link href="#demo">Discover your app <ArrowRight size={22} aria-hidden="true" /></Link>
      </section>

      <footer className="site-footer">
        <div className="footer-mark">content factory®</div>
        <p>Built for the Codex Hackathon.<br />Made with intent, not templates.</p>
        <div><Link href="#top">Back to top ↑</Link></div>
      </footer>
      </main>
    </>
  );
}
