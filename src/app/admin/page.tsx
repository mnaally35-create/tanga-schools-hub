"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal-header";
import { createClient } from "@/lib/supabase/client";

type School = {
  id: string; name: string; slug: string; school_type: string; registration_number: string | null;
  address: string | null; phone: string | null; email: string | null; created_at: string;
  rejection_reason: string | null; status: "pending" | "verified" | "rejected" | "suspended";
};
type Tab = "all" | School["status"];
const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All schools" }, { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" }, { id: "rejected", label: "Rejected" },
  { id: "suspended", label: "Suspended" },
];

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const { data: roles, error: roleError } = await supabase.from("platform_memberships").select("role").eq("user_id", user.id);
    if (roleError || !roles?.some((r) => ["super_admin", "regional_admin"].includes(r.role))) {
      router.replace("/dashboard"); return;
    }
    setAllowed(true);
    const { data, error: listError } = await supabase.from("schools")
      .select("id,name,slug,school_type,registration_number,address,phone,email,created_at,rejection_reason,status")
      .order("created_at", { ascending: false });
    if (listError) setError(listError.message);
    else setSchools((data ?? []) as School[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [router]);

  const counts = useMemo(() => ({
    all: schools.length,
    pending: schools.filter((s) => s.status === "pending").length,
    verified: schools.filter((s) => s.status === "verified").length,
    rejected: schools.filter((s) => s.status === "rejected").length,
    suspended: schools.filter((s) => s.status === "suspended").length,
  }), [schools]);

  const visibleSchools = useMemo(() => {
    const term = search.trim().toLowerCase();
    return schools.filter((school) => (tab === "all" || school.status === tab) &&
      (!term || [school.name, school.registration_number, school.address, school.email, school.phone]
        .some((value) => value?.toLowerCase().includes(term))));
  }, [schools, tab, search]);

  async function review(id: string, status: School["status"]) {
    if (status === "rejected" && rejectReason.trim().length < 8) {
      setError("Andika sababu ya kukataa ombi (angalau herufi 8)."); return;
    }
    setWorking(id); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase.from("schools").update({
      status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
      verified_by: status === "verified" ? user?.id : null,
      rejection_reason: status === "rejected" ? rejectReason.trim() : null,
    }).eq("id", id);
    if (updateError) setError(updateError.message);
    else {
      setSchools((current) => current.map((school) => school.id === id
        ? { ...school, status, rejection_reason: status === "rejected" ? rejectReason.trim() : null }
        : school));
      setRejectingId(""); setRejectReason("");
    }
    setWorking("");
  }

  return <><PortalHeader admin /><main className="dashboard-page"><div className="container dashboard-container">
    <div className="dashboard-top"><div><span className="eyebrow">PLATFORM MANAGEMENT</span><h1>Admin console</h1><p>Monitor school registrations and manage the platform directory.</p></div>
      <div className="dashboard-account-actions"><a className="button button-outline-dark" href="/admin/security">Security & Moderators</a><a className="button button-outline-dark" href="/profile">My profile</a></div>
    </div>
    {loading ? <div className="empty-state">Checking administrator access…</div> : !allowed
      ? <div className="empty-state"><h3>Access restricted</h3><p>{error || "You do not have permission to view this page."}</p></div>
      : <>
        {error && <div className="alert alert-error">{error}</div>}
        <section className="admin-metrics" aria-label="Platform statistics">
          <article><span>Total schools</span><strong>{counts.all}</strong><small>All submitted school records</small></article>
          <article><span>Pending review</span><strong>{counts.pending}</strong><small>Awaiting an administrator decision</small></article>
          <article><span>Verified schools</span><strong>{counts.verified}</strong><small>Visible in the public directory</small></article>
          <article><span>Rejected / suspended</span><strong>{counts.rejected + counts.suspended}</strong><small>{counts.rejected} rejected · {counts.suspended} suspended</small></article>
        </section>
        <div className="section-heading" style={{ marginTop: 32 }}><div><h2>School management</h2><p>Review applications and monitor the status of registered schools.</p></div></div>
        <div className="admin-toolbar">
          <div className="admin-tabs" role="tablist" aria-label="Filter schools">
            {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id}
              className={tab === item.id ? "admin-tab active" : "admin-tab"} onClick={() => setTab(item.id)}>
              {item.label} <span>{counts[item.id]}</span>
            </button>)}
          </div>
          <label className="admin-search"><span className="sr-only">Search schools</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, registration, email…" />
          </label>
        </div>
        {visibleSchools.length ? <div className="admin-list">{visibleSchools.map((school) =>
          <article className="admin-school" key={school.id}>
            <div className="admin-school-main"><span className="school-type">{school.school_type}</span>
              <span className={"admin-status status-" + school.status}>{school.status}</span>
              <h3>{school.name}</h3><p>{school.address || "Location not supplied"}</p>
              <small>{school.registration_number || "No registration number"} · {school.email || "No email"} · {school.phone || "No phone"}</small>
              {school.rejection_reason && <p className="admin-rejection-note">Reason: {school.rejection_reason}</p>}
              <small>Submitted {new Date(school.created_at).toLocaleDateString()}</small>
            </div>
            <div className="admin-actions">
              {school.status !== "verified" && <button className="button button-dark" disabled={working === school.id}
                onClick={() => void review(school.id, "verified")}>{working === school.id ? "Saving…" : "Approve"}</button>}
              {school.status !== "rejected" && <button className="button button-outline-dark" disabled={working === school.id}
                onClick={() => { setRejectingId(rejectingId === school.id ? "" : school.id); setRejectReason(""); }}>Reject</button>}
              {school.status === "verified" && <button className="button button-outline-dark" disabled={working === school.id}
                onClick={() => void review(school.id, "suspended")}>Suspend</button>}
              {school.status === "suspended" && <button className="button button-dark" disabled={working === school.id}
                onClick={() => void review(school.id, "verified")}>Restore</button>}
              {rejectingId === school.id && <div className="reject-reason-box"><label>Reason for rejection
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain what needs to be corrected…" rows={3} />
              </label><button className="button button-dark" disabled={working === school.id || rejectReason.trim().length < 8}
                onClick={() => void review(school.id, "rejected")}>{working === school.id ? "Saving…" : "Confirm rejection"}</button></div>}
            </div>
          </article>)}</div> : <div className="empty-state"><h3>No schools found</h3><p>Try another status filter or search term.</p></div>}
      </>}
  </div></main></>;
}
