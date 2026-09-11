import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bone,
  BookOpen,
  Box,
  Cat,
  Check,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileText,
  FishSymbol,
  Heart,
  Menu,
  MessageCircle,
  PackageCheck,
  PawPrint,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { docBySlug, docs, popularGuides, type DocPage as DocPageData } from './content';
import { AuthProvider } from './lib/auth';
import { AdminRedirect, AdminSupportPage } from './admin/AdminSupportPage';
import './styles.css';

const DEMO_URL = 'https://pack-wpsu1enm.myshopify.com';

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'PALS Theme — Documentation & Merchant Support',
    description: 'Setup guides, feature documentation and merchant support for the PALS Shopify theme.'
  },
  '/documentation': {
    title: 'PALS Documentation — Setup and Feature Guides',
    description: 'Install, configure and customize the PALS Shopify theme with practical merchant guides.'
  },
  '/support': {
    title: 'PALS Theme Support — Submit a Request',
    description: 'Send a detailed support request to the PALS Shopify theme support team.'
  },
  '/changelog': {
    title: 'PALS Theme Changelog',
    description: 'Review new features, improvements and fixes released for the PALS Shopify theme.'
  },
  '/privacy': {
    title: 'Privacy — PALS Theme Support',
    description: 'How PALS Theme Support handles information submitted through the support website.'
  },
  '/terms': {
    title: 'Support Terms — PALS Theme',
    description: 'Terms governing documentation and merchant support for the PALS Shopify theme.'
  }
};

function usePageMetadata() {
  const location = useLocation();

  useEffect(() => {
    const docSlug = location.pathname.startsWith('/documentation/')
      ? location.pathname.replace('/documentation/', '')
      : null;
    const doc = docSlug ? docBySlug.get(docSlug) : null;
    const meta = doc
      ? { title: `${doc.title} — PALS Documentation`, description: doc.intro }
      : pageMeta[location.pathname] ?? {
          title: 'Page not found — PALS Theme',
          description: 'The requested PALS Theme support page could not be found.'
        };

    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = `${window.location.origin}${location.pathname}`;

    const setMeta = (property: string, content: string, attribute = 'property') => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.append(element);
      }
      element.content = content;
    };
    setMeta('og:title', meta.title);
    setMeta('og:description', meta.description);
    setMeta('og:type', 'website');
    setMeta('og:url', canonical.href);
    setMeta('twitter:card', 'summary', 'name');
    setMeta('twitter:title', meta.title, 'name');
    setMeta('twitter:description', meta.description, 'name');

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="PALS theme support home">
      <PawPrint aria-hidden="true" />
      <span>PALS!</span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <div className="announcement">DOCUMENTATION, UPDATES AND REAL SUPPORT FOR PALS MERCHANTS.</div>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <NavLink to="/documentation">Documentation</NavLink>
            <a href="/#features">Features</a>
            <NavLink to="/changelog">Changelog</NavLink>
            <NavLink to="/support">Support</NavLink>
          </nav>
          <a className="button button-cream header-demo" href={DEMO_URL} target="_blank" rel="noreferrer">
            View demo <ExternalLink size={16} aria-hidden="true" />
          </a>
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <div className="paw-divider" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <PawPrint key={index} />)}
        </div>
        {open && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            <NavLink to="/documentation">Documentation</NavLink>
            <a href="/#features">Features</a>
            <NavLink to="/changelog">Changelog</NavLink>
            <NavLink to="/support">Support</NavLink>
            <a href={DEMO_URL} target="_blank" rel="noreferrer">View demo store</a>
          </nav>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Logo />
          <p>Documentation and support for a playful Shopify theme built around real commerce.</p>
        </div>
        <div>
          <h2>Learn</h2>
          <Link to="/documentation">Documentation</Link>
          <Link to="/changelog">Changelog</Link>
          <a href={DEMO_URL} target="_blank" rel="noreferrer">Demo store</a>
        </div>
        <div>
          <h2>Support</h2>
          <Link to="/support">Contact support</Link>
          <Link to="/documentation/troubleshooting">Troubleshooting</Link>
          <Link to="/documentation/accessibility">Accessibility</Link>
        </div>
        <div>
          <h2>Legal</h2>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PALS Theme. All rights reserved.</span>
        <span>Made for pet brands and their people.</span>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 700);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!visible) return null;
  return (
    <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
      <Bone aria-hidden="true" />
      <ArrowUp aria-hidden="true" />
    </button>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  usePageMetadata();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}

const features = [
  { icon: <ShoppingBag />, title: 'Merchant-controlled', text: 'Products, collections, colors, visuals and motion are configured through Shopify’s native editor.' },
  { icon: <PawPrint />, title: 'Built for pet brands', text: 'Made for pet food, wellness, treats, toys, accessories and subscription-focused stores.' },
  { icon: <PackageCheck />, title: 'Conversion features', text: 'Recommendations, recently viewed products, quick buy, cart upsells, bundles and guided discovery.' },
  { icon: <ShieldCheck />, title: 'Responsive by default', text: 'Purpose-built mobile layouts, accessible interactions and reduced-motion support.' }
];

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">SHOPIFY THEME SUPPORT</span>
          <h1>Good stores deserve <mark>great support.</mark></h1>
          <p>Setup guides, feature documentation and direct merchant support for the PALS Shopify theme.</p>
          <div className="button-row">
            <Link className="button button-yellow" to="/documentation">Explore documentation <ArrowRight aria-hidden="true" /></Link>
            <Link className="text-link" to="/support">Contact support <ChevronRight aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="hero-art" aria-label="PALS theme mobile storefront preview">
          <div className="hero-sticker"><Sparkles aria-hidden="true" /> REAL SUPPORT.<br />WAG-WORTHY<br />RESULTS.</div>
          <div className="hero-image-frame">
            <img src="/pals-theme-preview.jpg" alt="PALS pet store theme displayed on a mobile layout" />
          </div>
          <div className="hero-note">PLAYFUL COMMERCE.<br />SERIOUS FLEXIBILITY.</div>
        </div>
      </section>

      <section id="features" className="section-block">
        <div className="section-heading">
          <span className="eyebrow">WHAT PALS SUPPORTS</span>
          <h2>Built for real pet commerce.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className={`feature-card feature-${index + 1}`} key={feature.title}>
              <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block guides-section">
        <div className="section-heading inline-heading">
          <div>
            <span className="eyebrow">POPULAR GUIDES</span>
            <h2>Start with the feature you need.</h2>
          </div>
          <Link className="text-link" to="/documentation">View all guides <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="guide-grid">
          {popularGuides.map((guide, index) => (
            <Link className="guide-card" to={`/documentation/${guide.slug}`} key={guide.slug}>
              <span className="guide-number">0{index + 1}</span>
              <div><h3>{guide.title}</h3><p>{guide.intro}</p></div>
              <span className="circle-arrow"><ArrowRight aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="support-banner">
        <div className="support-mascot" aria-hidden="true"><Cat /><PawPrint /></div>
        <div><span className="eyebrow">DIRECT SUPPORT</span><h2>Still chasing the answer?</h2><p>Send your store URL, screenshots and a precise description so the issue can be reproduced.</p></div>
        <Link className="button button-yellow" to="/support">Contact PALS support <MessageCircle aria-hidden="true" /></Link>
      </section>
    </>
  );
}

function DocSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return docs.filter((doc) =>
      [doc.title, doc.intro, ...doc.keywords, ...doc.sections.flatMap((section) => [section.title, ...(section.body ?? []), ...(section.bullets ?? [])])]
        .some((value) => value.toLowerCase().includes(normalized))
    ).slice(0, 6);
  }, [query]);

  return (
    <div className={`doc-search ${compact ? 'compact' : ''}`}>
      <Search aria-hidden="true" />
      <label className="sr-only" htmlFor={compact ? 'doc-search-compact' : 'doc-search'}>Search documentation</label>
      <input id={compact ? 'doc-search-compact' : 'doc-search'} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search setup, cart, quiz…" />
      {query && (
        <div className="search-results" aria-live="polite">
          {results.length ? results.map((doc) => (
            <Link to={`/documentation/${doc.slug}`} key={doc.slug} onClick={() => setQuery('')}>
              <span>{doc.title}</span><ChevronRight aria-hidden="true" />
            </Link>
          )) : <p>No guides matched “{query}”.</p>}
        </div>
      )}
    </div>
  );
}

function DocsIndexPage() {
  return (
    <div className="docs-index page-wrap">
      <div className="page-intro docs-intro">
        <span className="eyebrow">PALS DOCUMENTATION</span>
        <h1>Set up the theme without guesswork.</h1>
        <p>Merchant-focused guides covering installation, product discovery, bundles, cart behavior and visual customization.</p>
        <DocSearch />
      </div>
      <div className="docs-card-grid">
        {docs.map((doc, index) => (
          <Link className="docs-index-card" to={`/documentation/${doc.slug}`} key={doc.slug}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{doc.title}</h2>
            <p>{doc.intro}</p>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function DocsSidebar({ current }: { current?: string }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <DocSearch compact />
      <Link className="docs-overview-link" to="/documentation"><BookOpen aria-hidden="true" /> Documentation home</Link>
      <nav>
        {docs.map((doc) => (
          <NavLink className={current === doc.slug ? 'active' : ''} to={`/documentation/${doc.slug}`} key={doc.slug}>{doc.title}</NavLink>
        ))}
      </nav>
      <div className="sidebar-help"><CircleHelp aria-hidden="true" /><strong>Need help?</strong><span>Send the store URL and exact steps to reproduce the issue.</span><Link to="/support">Open support form</Link></div>
    </aside>
  );
}

function Note({ note }: { note: NonNullable<DocPageData['sections'][number]['note']> }) {
  const icon = note.type === 'warning' ? <ShieldCheck /> : note.type === 'tip' ? <Sparkles /> : <CircleHelp />;
  return <div className={`doc-note ${note.type}`}>{icon}<div><strong>{note.type === 'warning' ? 'Important' : note.type === 'tip' ? 'Good practice' : 'Note'}</strong><p>{note.text}</p></div></div>;
}

function DocArticlePage() {
  const { slug = '' } = useParams();
  const doc = docBySlug.get(slug);
  const index = docs.findIndex((item) => item.slug === slug);

  if (!doc) return <NotFoundPage />;

  return (
    <div className="docs-layout page-wrap">
      <DocsSidebar current={slug} />
      <article className="doc-article">
        <div className="breadcrumbs"><Link to="/documentation">Documentation</Link><ChevronRight aria-hidden="true" /><span>{doc.title}</span></div>
        <header><span className="eyebrow">{doc.eyebrow}</span><h1>{doc.title}</h1><p>{doc.intro}</p></header>
        <div className="mobile-toc"><strong>On this page</strong>{doc.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</div>
        {doc.sections.map((section) => (
          <section id={section.id} className="doc-section" key={section.id}>
            <h2>{section.title}</h2>
            {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            {section.note && <Note note={section.note} />}
          </section>
        ))}
        <nav className="article-pagination" aria-label="Guide pagination">
          {index > 0 ? <Link to={`/documentation/${docs[index - 1].slug}`}><ArrowLeft aria-hidden="true" /><span><small>Previous</small>{docs[index - 1].title}</span></Link> : <span />}
          {index < docs.length - 1 ? <Link to={`/documentation/${docs[index + 1].slug}`}><span><small>Next</small>{docs[index + 1].title}</span><ArrowRight aria-hidden="true" /></Link> : <span />}
        </nav>
      </article>
      <aside className="article-toc"><strong>On this page</strong>{doc.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</aside>
    </div>
  );
}

type SupportForm = {
  firstName: string;
  lastName: string;
  email: string;
  storeUrl: string;
  themeName: string;
  subject: string;
  description: string;
  consent: boolean;
  company: string;
};

const emptySupportForm: SupportForm = {
  firstName: '', lastName: '', email: '', storeUrl: '', themeName: 'PALS', subject: '', description: '', consent: false, company: ''
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'validation_error' | 'server_error';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-support-ticket`;
const ALLOWED_FILE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function SupportPage() {
  const [form, setForm] = useState<SupportForm>(emptySupportForm);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const renderTimeRef = useRef(Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof SupportForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setReference('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStatus('validation_error');
      setMessage('Please enter your first and last name.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus('validation_error');
      setMessage('Please enter a valid email address.');
      return;
    }
    if (!form.storeUrl.trim() || !/^https?:\/\/.+\..+/.test(form.storeUrl)) {
      setStatus('validation_error');
      setMessage('Please enter a valid Shopify store URL.');
      return;
    }
    if (form.description.trim().length < 30) {
      setStatus('validation_error');
      setMessage('Describe the issue in at least 30 characters.');
      return;
    }
    if (file && file.size > MAX_FILE_SIZE) {
      setStatus('validation_error');
      setMessage('The attachment must be 5 MB or smaller.');
      return;
    }
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop() || '';
      if (!['png', 'jpg', 'jpeg', 'webp', 'pdf'].includes(ext)) {
        setStatus('validation_error');
        setMessage('Unsupported file format. Allowed: JPG, JPEG, PNG, WEBP, PDF.');
        return;
      }
    }
    if (!form.consent) {
      setStatus('validation_error');
      setMessage('Please acknowledge the privacy notice to continue.');
      return;
    }

    setStatus('submitting');

    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('name', `${form.firstName} ${form.lastName}`);
    formData.append('email', form.email);
    formData.append('storeUrl', form.storeUrl);
    formData.append('themeName', form.themeName || 'PALS');
    formData.append('subject', form.subject);
    formData.append('description', form.description);
    formData.append('consent', String(form.consent));
    formData.append('company', form.company);
    formData.append('_t', String(renderTimeRef.current));
    if (file) formData.append('attachment', file);

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'The request could not be sent. Try again later.');
      }

      setStatus('success');
      setReference(data.reference || '');
      setMessage(data.message || `Request ${data.reference} was received.`);
      setForm(emptySupportForm);
      setFile(null);
      renderTimeRef.current = Date.now();

      setTimeout(() => {
        successRef.current?.focus();
      }, 50);
    } catch (error) {
      setStatus('server_error');
      setMessage(error instanceof Error ? error.message : 'The request could not be sent. Try again later.');
    }
  };

  const statusClass = status === 'success' ? 'success' : status === 'validation_error' || status === 'server_error' ? 'error' : '';

  return (
    <div className="support-page page-wrap">
      <div className="support-copy">
        <span className="eyebrow">PALS MERCHANT SUPPORT</span>
        <h1>Tell us what’s going on.</h1>
        <p>Provide enough detail to reproduce the issue. Include your store URL, affected page and a screenshot when relevant.</p>
        <div className="support-points">
          <div><Check aria-hidden="true" /><span><strong>Theme-specific help</strong>Setup, configuration and verified theme defects.</span></div>
          <div><Check aria-hidden="true" /><span><strong>Useful replies</strong>Every request receives a reference number and email confirmation.</span></div>
          <div><Check aria-hidden="true" /><span><strong>Secure submission</strong>Information is used only to investigate and answer the request.</span></div>
        </div>
        <div className="support-boundary"><Bone aria-hidden="true" /><p><strong>Before submitting:</strong> test the issue in an unpublished copy of PALS with app embeds temporarily disabled. Never send passwords, API keys or customer payment information.</p></div>
      </div>
      <form className="support-form" onSubmit={submit} noValidate>
        <div className="form-heading"><PawPrint aria-hidden="true" /><div><span>SUPPORT REQUEST</span><h2>Store and issue details</h2></div></div>
        <div className="form-grid">
          <label><span>First name *</span><input required autoComplete="given-name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></label>
          <label><span>Last name *</span><input required autoComplete="family-name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></label>
          <label className="wide"><span>Email address *</span><input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
          <label className="wide"><span>Shopify store URL *</span><input required type="url" inputMode="url" placeholder="https://your-store.myshopify.com" value={form.storeUrl} onChange={(e) => update('storeUrl', e.target.value)} /></label>
          <label><span>Theme name</span><input value={form.themeName} onChange={(e) => update('themeName', e.target.value)} readOnly /></label>
          <label><span>Subject</span><input value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="Brief summary of the issue" /></label>
          <label className="wide"><span>Description *</span><textarea required minLength={30} rows={7} placeholder="What happened, what did you expect, and how can we reproduce it?" value={form.description} onChange={(e) => update('description', e.target.value)} /><small>{form.description.length}/30 minimum characters</small></label>
          <div className="wide upload-field">
            <span>Attachment</span>
            <label className="upload-control"><Upload aria-hidden="true" /><span>{file ? file.name : 'Add screenshot or PDF'}<small>PNG, JPG, JPEG, WEBP or PDF — maximum 5 MB</small></span><input type="file" accept={ALLOWED_FILE_EXTS.join(',')} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
            {file && <button type="button" className="remove-file" onClick={() => setFile(null)}>Remove attachment</button>}
          </div>
          <label className="honeypot" aria-hidden="true"><span>Company</span><input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => update('company', e.target.value)} /></label>
          <label className="wide consent"><input required type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I agree to the processing of this information for support purposes as described in the <Link to="/privacy">Privacy notice</Link>. *</span></label>
        </div>
        {message && (
          <div
            ref={status === 'success' ? successRef : undefined}
            tabIndex={status === 'success' ? -1 : undefined}
            className={`form-status ${statusClass}`}
            role={status === 'validation_error' || status === 'server_error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {status === 'success' ? <Check /> : <CircleHelp />}
            <span>
              {status === 'success' && reference ? (
                <><strong>Your request {reference} was received.</strong><br />{message}</>
              ) : message}
            </span>
          </div>
        )}
        <button className="button button-blue submit-button" type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
          {status === 'submitting' ? (
            <><span className="admin-spinner admin-spinner-inline" aria-hidden="true" /> Sending request…</>
          ) : (
            <>Send support request <ArrowRight aria-hidden="true" /></>
          )}
        </button>
      </form>
    </div>
  );
}

function ChangelogPage() {
  const changes = ['Introduced PALS branding and its merchant-ready preset.', 'Added merchant-controlled product and collection sections.', 'Added the configurable Pet Finder Quiz and Build a Box.', 'Added slide-out cart, upsells and bone or fishbone shipping-progress styles.', 'Added cat, dog and uploaded transparent pet visuals.', 'Added product-card decoration, second-image and hover options.', 'Added recently viewed products and native Shopify recommendations.', 'Improved mobile layout, reduced-motion behavior and accessibility.'];
  return (
    <div className="narrow-page page-wrap">
      <div className="page-intro"><span className="eyebrow">RELEASE NOTES</span><h1>PALS changelog</h1><p>Features, improvements and fixes included in public theme releases.</p></div>
      <article className="release-card"><div className="release-meta"><span>VERSION 2.0.0</span><strong>Current release</strong></div><h2>Premium pet-commerce foundation</h2><ul>{changes.map((change) => <li key={change}><Check aria-hidden="true" />{change}</li>)}</ul></article>
    </div>
  );
}

function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const privacy = type === 'privacy';
  return (
    <div className="legal-page page-wrap">
      <div className="page-intro"><span className="eyebrow">{privacy ? 'PRIVACY' : 'SUPPORT TERMS'}</span><h1>{privacy ? 'Privacy notice' : 'Support terms'}</h1><p>Last updated: September 11, 2026</p></div>
      {privacy ? (
        <>
          <section><h2>Information collected</h2><p>The support form collects the name, email address, Shopify store URL, issue details and any optional attachment submitted by the merchant.</p></section>
          <section><h2>How information is used</h2><p>The information is used to identify, reproduce, investigate and answer PALS theme support requests. It is not sold or used for unrelated advertising.</p></section>
          <section><h2>Email and attachments</h2><p>Support notifications and confirmations are delivered through Resend. Attachments are transferred only for investigating the submitted request. Merchants must not submit passwords, API keys, payment information or unnecessary customer data.</p></section>
          <section><h2>Retention and deletion</h2><p>Support records are retained only as long as reasonably necessary to resolve requests, maintain a defect history and meet legal obligations. A deletion request can be submitted through the support form using the category Other.</p></section>
        </>
      ) : (
        <>
          <section><h2>Scope of support</h2><p>Support covers installation, documented configuration and reproducible defects in the current unmodified version of PALS. Store strategy, custom development, third-party apps and unsupported code modifications are outside standard theme support.</p></section>
          <section><h2>Merchant responsibilities</h2><p>Merchants must maintain a backup before changing theme code, provide accurate reproduction steps and avoid sharing credentials or sensitive customer information.</p></section>
          <section><h2>Third-party services</h2><p>Shopify, apps, payment services, shipping providers and other third-party platforms operate under their own terms. PALS cannot guarantee the availability or behavior of third-party services.</p></section>
          <section><h2>Documentation</h2><p>Documentation describes the current public release and may be updated when features, Shopify behavior or supported configurations change.</p></section>
        </>
      )}
    </div>
  );
}

function NotFoundPage() {
  return <div className="not-found page-wrap"><FishSymbol aria-hidden="true" /><span className="eyebrow">404 — LOST THE TRAIL</span><h1>This page wandered off.</h1><p>Return to the documentation or search for the feature you need.</p><Link className="button button-yellow" to="/documentation">Open documentation <ArrowRight /></Link></div>;
}

function App() {
  useEffect(() => {
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PALS Theme', applicationCategory: 'BusinessApplication', operatingSystem: 'Shopify', description: 'A playful editorial Shopify theme for pet-care and pet-supply merchants.' });
    document.head.append(schema);
    return () => schema.remove();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/documentation" element={<DocsIndexPage />} />
        <Route path="/documentation/:slug" element={<DocArticlePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
