"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

type School = { id: string; name: string; slug: string; school_type: "government" | "private"; ward: string | null; address: string | null; district_id: string | null; districts?: { name: string } | null };

type News = { id: string; title: string; excerpt: string | null; published_at: string | null; schools?: { name: string; slug: string } | null };

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("schools").select("id,name,slug,school_type,ward,address,district_id,districts(name)").eq("status", "verified").order("name").limit(60),
      supabase.from("school_news").select("id,title,excerpt,published_at,schools(name,slug)").eq("is_published", true).order("published_at", { ascending: false }).limit(3),
    ]).then(([schoolResult, newsResult]) => {
      if (schoolResult.error) setLoadError("School directory is temporarily unavailable.");
      else setSchools((schoolResult.data ?? []) as unknown as School[]);
      if (!newsResult.error) setNews((newsResult.data ?? []) as unknown as News[]);
      setLoading(false);
    }).catch(() => { setLoadError("Could not connect to the school directory."); setLoading(false); });
  }, []);

  const filtered = useMemo(() => schools.filter((school) => {
    const matchesQuery = `${school.name} ${school.ward ?? ""} ${school.address ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (type === "all" || school.school_type === type);
  }), [schools, query, type]);

  return <div className="public-site"><SiteHeader />
    <main>
      <section className="hero" id="home"><div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/>
        <div className="container hero-grid"><div className="hero-copy"><span className="eyebrow eyebrow-light">THE FUTURE OF EDUCATION IN TANGA</span><h1>One Region.<br/><em>All Schools.</em><br/>One Digital Hub.</h1><p>Discover secondary schools, explore educational opportunities and connect with the education community across Tanga Region.</p><div className="hero-actions"><a className="button button-gold" href="#schools">Explore Schools <span>→</span></a><Link className="button button-outline" href="/register">Register Your School</Link></div><div className="hero-note"><span className="live-dot"/> A growing digital home for Tanga education</div></div>
          <div className="hero-panel"><div className="panel-kicker">DISCOVER TANGA</div><h2>Education without boundaries.</h2><p>A connected digital home for secondary schools, educators, students and families.</p><div className="feature-grid"><div className="feature-tile"><span>⌂</span><strong>School Directory</strong><small>Discover schools</small></div><div className="feature-tile"><span>▤</span><strong>Learning Hub</strong><small>Learning resources</small></div><div className="feature-tile"><span>▧</span><strong>School News</strong><small>Latest updates</small></div><div className="feature-tile"><span>✧</span><strong>Opportunities</strong><small>Explore your future</small></div></div></div>
        </div>
      </section>
      <section className="search-section container"><div className="search-card"><div><h2>Find your school</h2><p>Search verified secondary schools across Tanga Region.</p></div><div className="search-controls"><label className="sr-only" htmlFor="school-search">Search school</label><input id="school-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search school by name or location..."/><select aria-label="School type" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All school types</option><option value="government">Government</option><option value="private">Private</option></select><a className="button button-dark" href="#schools">Search</a></div></div></section>
      <section className="section container" id="schools"><div className="section-heading"><div><span className="eyebrow">SCHOOL DIRECTORY</span><h2>Discover Our Schools</h2><p>Explore verified government and private secondary schools.</p></div><span className="count-pill">{schools.length} verified</span></div>
        {loading ? <div className="empty-state">Loading school directory…</div> : loadError ? <div className="empty-state">{loadError} Please refresh the page.</div> : filtered.length ? <div className="school-grid">{filtered.map((school) => <Link className="school-card" href={`/schools/${school.slug}`} key={school.id}><div className="school-card-icon">{school.school_type === "government" ? "🏫" : "🎓"}</div><span className="school-type">{school.school_type === "government" ? "GOVERNMENT" : "PRIVATE"}</span><h3>{school.name}</h3><p>{school.address || school.ward || "Tanga Region, Tanzania"}</p><span className="school-card-link">View school profile →</span></Link>)}</div> : <div className="empty-state"><div className="empty-icon">🏫</div><h3>{query ? "No matching schools found" : "Our school directory is growing"}</h3><p>{query ? "Try another school name or remove a filter." : "Verified school profiles will appear here as schools are approved to join TANGA SCHOOLS HUB."}</p><Link className="button button-dark" href="/register">Register a School</Link></div>}
      </section>
      <section className="district-section" id="districts"><div className="container section"><div className="section-heading"><div><span className="eyebrow">EXPLORE BY LOCATION</span><h2>Across Tanga Region</h2><p>Our directory is designed to bring schools from every district together.</p></div></div><div className="district-callout"><div className="district-map-mark">⌖</div><div><h3>One regional directory</h3><p>District and ward filters will be populated from the verified administrative directory as it is confirmed and added to the platform.</p></div><Link className="text-link" href="/register">Add your school →</Link></div></div></section>
      <section className="section container" id="news"><div className="section-heading"><div><span className="eyebrow">STAY INFORMED</span><h2>Education & Opportunities</h2><p>Updates published by participating schools.</p></div></div>{news.length ? <div className="news-grid">{news.map((item) => <article className="news-card" key={item.id}><span className="news-symbol">▤</span><h3>{item.title}</h3><p>{item.excerpt || "Read the latest update from the school."}</p><small>{item.schools?.name || "Tanga Schools Hub"}</small></article>)}</div> : <div className="news-placeholder"><div className="news-mini-grid"><span>▤</span><span>✧</span><span>⌂</span></div><div><h3>School news is coming soon</h3><p>Approved school administrators will be able to publish announcements and education updates from their dashboards.</p></div></div>}</section>
      <section className="join-banner"><div className="container join-inner"><div><span className="eyebrow eyebrow-light">BE PART OF THE NETWORK</span><h2>Bring your school into one connected future.</h2><p>Register your school and help build Tanga’s shared education directory.</p></div><Link className="button button-gold" href="/register">Get Started →</Link></div></section>
    </main>
    <footer className="footer" id="about"><div className="container footer-inner"><div><Link href="/" className="brand brand-footer"><span className="brand-mark">T</span><span><strong>TANGA SCHOOLS</strong><small>HUB</small></span></Link><p>Connecting schools, empowering learners and building a stronger digital education community.</p></div><div className="footer-side"><strong>One Region. All Schools. One Digital Future.</strong><span>Tanga Region, Tanzania</span><Link href="/login">School Login</Link></div></div><div className="footer-bottom">© 2026 TANGA SCHOOLS HUB. All rights reserved.</div></footer>
  </div>;
}
