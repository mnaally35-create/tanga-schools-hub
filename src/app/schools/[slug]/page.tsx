"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

type School = { id: string; name: string; slug: string; school_type: string; registration_number: string | null; ward: string | null; address: string | null; description: string | null; phone: string | null; email: string | null; website: string | null; logo_url: string | null; status: string };
export default function SchoolProfilePage() {
  const params = useParams<{ slug: string }>(); const [school,setSchool] = useState<School | null>(null); const [loading,setLoading] = useState(true);
  useEffect(() => { createClient().from("schools").select("*").eq("slug",params.slug).eq("status","verified").maybeSingle().then(({data})=>{setSchool(data as School | null);setLoading(false);}); },[params.slug]);
  return <><SiteHeader/><main className="profile-page"><div className="container profile-container"><Link href="/" className="back-link">← Back to directory</Link>{loading ? <div className="empty-state">Loading school profile…</div> : !school ? <div className="empty-state"><h2>School profile not found</h2><p>This school may not yet be verified or the link may be incorrect.</p><Link className="button button-dark" href="/">Return home</Link></div> : <article className="profile-card"><div className="profile-emblem">🏫</div><span className="school-type">{school.school_type === "government" ? "GOVERNMENT SCHOOL" : "PRIVATE SCHOOL"}</span><h1>{school.name}</h1><p className="profile-location">{school.address || school.ward || "Tanga Region, Tanzania"}</p>{school.description && <p className="profile-description">{school.description}</p>}<div className="profile-details">{school.registration_number && <div><small>Registration number</small><strong>{school.registration_number}</strong></div>}{school.phone && <div><small>Phone</small><strong>{school.phone}</strong></div>}{school.email && <div><small>Email</small><strong>{school.email}</strong></div>}{school.website && <div><small>Website</small><a href={school.website} target="_blank" rel="noreferrer">{school.website}</a></div>}</div></article>}</div></main></>;
}
