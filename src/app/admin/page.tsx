"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

type PendingSchool = { id: string; name: string; slug: string; school_type: string; registration_number: string | null; address: string | null; phone: string | null; email: string | null; created_at: string };
export default function AdminPage() {
  const router = useRouter(); const [allowed,setAllowed] = useState(false); const [loading,setLoading] = useState(true); const [schools,setSchools] = useState<PendingSchool[]>([]); const [error,setError] = useState(""); const [working,setWorking] = useState("");
  async function load() { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace("/login"); return; }
    const { data: roles, error: roleError } = await supabase.from("platform_memberships").select("role").eq("user_id",user.id);
    if (roleError || !roles?.some((r) => ["super_admin","regional_admin"].includes(r.role))) { setError("This account does not have platform administrator access."); setLoading(false); return; }
    setAllowed(true); const { data, error: listError } = await supabase.from("schools").select("id,name,slug,school_type,registration_number,address,phone,email,created_at").eq("status","pending").order("created_at");
    if (listError) setError(listError.message); else setSchools((data ?? []) as PendingSchool[]); setLoading(false);
  }
  useEffect(()=>{load();},[]);
  async function review(id: string, status: "verified" | "rejected") { setWorking(id); setError(""); const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); const { error } = await supabase.from("schools").update({ status, verified_at: status === "verified" ? new Date().toISOString() : null, verified_by: status === "verified" ? user?.id : null }).eq("id",id); if (error) setError(error.message); else setSchools((current)=>current.filter((school)=>school.id!==id)); setWorking(""); }
  return <><SiteHeader/><main className="dashboard-page"><div className="container dashboard-container"><div className="dashboard-top"><div><span className="eyebrow">PLATFORM MANAGEMENT</span><h1>School verification</h1><p>Review school submissions before they appear in the public directory.</p></div></div>{loading ? <div className="empty-state">Checking administrator access…</div> : !allowed ? <div className="empty-state"><h3>Access restricted</h3><p>{error}</p></div> : <><div className="section-heading" style={{marginTop:32}}><div><h2>Pending applications</h2><p>{schools.length} school profile(s) awaiting review.</p></div></div>{error && <div className="alert alert-error">{error}</div>}{schools.length ? <div className="admin-list">{schools.map((school)=><article className="admin-school" key={school.id}><div><span className="school-type">{school.school_type}</span><h3>{school.name}</h3><p>{school.address || "Location not supplied"}</p><small>{school.registration_number || "No registration number"} · {school.email || "No email"} · {school.phone || "No phone"}</small></div><div className="admin-actions"><button className="button button-dark" disabled={working===school.id} onClick={()=>review(school.id,"verified")}>Approve</button><button className="button button-outline-dark" disabled={working===school.id} onClick={()=>review(school.id,"rejected")}>Reject</button></div></article>)}</div> : <div className="empty-state"><h3>No pending applications</h3><p>New school submissions will appear here.</p></div>}</>}</div></main></>;
}
