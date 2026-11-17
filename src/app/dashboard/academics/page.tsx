"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal-header";
import { createClient } from "@/lib/supabase/client";

type School = { id: string; name: string; status: string };
type SchoolClass = { id: string; school_id: string; academic_year: number; level: "o_level" | "a_level"; form_number: number; stream_name: string };
type Subject = { id: string; school_id: string; level: "o_level" | "a_level"; subject_name: string; subject_code: string | null; is_active: boolean };

export default function AcademicsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [level, setLevel] = useState<"o_level" | "a_level">("o_level");
  const [formNumber, setFormNumber] = useState("1");
  const [stream, setStream] = useState("A");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectLevel, setSubjectLevel] = useState<"o_level" | "a_level">("o_level");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedSchool = useMemo(() => schools.find((s) => s.id === schoolId) ?? null, [schools, schoolId]);
  const formOptions = level === "o_level" ? [1, 2, 3, 4] : [5, 6];

  async function loadSchoolData(id: string) {
    const supabase = createClient();
    const [{ data: classRows, error: classError }, { data: subjectRows, error: subjectError }] = await Promise.all([
      supabase.from("school_classes").select("id,school_id,academic_year,level,form_number,stream_name").eq("school_id", id).order("academic_year", { ascending: false }).order("form_number").order("stream_name"),
      supabase.from("school_subjects").select("id,school_id,level,subject_name,subject_code,is_active").eq("school_id", id).order("level").order("subject_name")
    ]);
    if (classError || subjectError) setError(classError?.message ?? subjectError?.message ?? "Failed to load academic setup.");
    setClasses((classRows ?? []) as SchoolClass[]);
    setSubjects((subjectRows ?? []) as Subject[]);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data, error: memberError } = await supabase.from("school_memberships")
        .select("school_id,role,is_active,schools(id,name,status)")
        .eq("user_id", user.id).eq("is_active", true).eq("role", "school_admin");
      if (!active) return;
      if (memberError) { setError(memberError.message); setLoading(false); return; }
      const allowed = (data ?? []).map((m: any) => m.schools).filter(Boolean) as School[];
      if (!allowed.length) { router.replace("/dashboard"); return; }
      setSchools(allowed);
      setSchoolId(allowed[0].id);
      await loadSchoolData(allowed[0].id);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [router]);

  async function chooseSchool(id: string) {
    setSchoolId(id); setError(""); setNotice("");
    await loadSchoolData(id);
  }

  async function addClass(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    const { error } = await createClient().from("school_classes").insert({
      school_id: schoolId, academic_year: Number(year), level, form_number: Number(formNumber), stream_name: stream.trim().toUpperCase()
    });
    if (error) setError(error.code === "23505" ? "Darasa lenye mwaka, form na mkondo huo tayari lipo." : error.message);
    else { setNotice("Darasa limeongezwa kikamilifu."); setStream("A"); await loadSchoolData(schoolId); }
    setSaving(false);
  }

  async function addSubject(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    const { error } = await createClient().from("school_subjects").insert({
      school_id: schoolId, level: subjectLevel, subject_name: subjectName.trim(), subject_code: subjectCode.trim() || null
    });
    if (error) setError(error.code === "23505" ? "Somo hili au code yake tayari imesajiliwa kwenye level hiyo." : error.message);
    else { setNotice("Somo limeongezwa kikamilifu."); setSubjectName(""); setSubjectCode(""); await loadSchoolData(schoolId); }
    setSaving(false);
  }

  async function removeClass(item: SchoolClass) {
    if (!window.confirm(`Una uhakika unataka kufuta Form ${item.form_number} ${item.stream_name}?`)) return;
    const { error } = await createClient().from("school_classes").delete().eq("id", item.id);
    if (error) setError(error.message); else { setNotice("Darasa limefutwa."); await loadSchoolData(schoolId); }
  }

  async function toggleSubject(item: Subject) {
    const { error } = await createClient().from("school_subjects").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) setError(error.message); else { setNotice(item.is_active ? "Somo limezimwa." : "Somo limewashwa."); await loadSchoolData(schoolId); }
  }

  return <><PortalHeader /><main className="dashboard-page"><div className="container dashboard-container">
    <div className="dashboard-top"><div><span className="eyebrow">SCHOOL MANAGEMENT</span><h1>Academic setup</h1><p>Simamia madarasa, mikondo na masomo ya shule yako.</p></div><Link className="button button-outline-dark" href="/dashboard">Back to dashboard</Link></div>
    {loading ? <div className="empty-state">Inapakia taarifa za shule…</div> : <>
      {schools.length > 1 && <label className="academic-school-select">Chagua shule<select value={schoolId} onChange={(e) => void chooseSchool(e.target.value)}>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
      {selectedSchool && <div className="academic-school-banner"><strong>{selectedSchool.name}</strong><span className={`status status-${selectedSchool.status}`}>{selectedSchool.status}</span></div>}
      {(error || notice) && <div className={error ? "alert alert-error" : "alert alert-success"} role="status">{error || notice}</div>}
      <div className="academic-setup-grid">
        <section className="dashboard-section form-panel"><div className="section-heading"><div><h2>Ongeza darasa</h2><p>Chagua level, form, mkondo na mwaka wa masomo.</p></div></div>
          <form className="form-grid" onSubmit={addClass}>
            <label>Level<select value={level} onChange={(e) => { const next = e.target.value as "o_level" | "a_level"; setLevel(next); setFormNumber(next === "o_level" ? "1" : "5"); }}><option value="o_level">O-Level</option><option value="a_level">A-Level</option></select></label>
            <label>Form<select value={formNumber} onChange={(e) => setFormNumber(e.target.value)}>{formOptions.map((n) => <option key={n} value={n}>Form {n}</option>)}</select></label>
            <label>Mwaka wa masomo<input required type="number" min="2020" max="2100" value={year} onChange={(e) => setYear(e.target.value)} /></label>
            <label>Mkondo / Stream<input required maxLength={30} value={stream} onChange={(e) => setStream(e.target.value)} placeholder="A, B, C…" /></label>
            <div className="field-span"><button className="button button-dark" disabled={saving || !schoolId}>{saving ? "Inahifadhi…" : "Hifadhi darasa"}</button></div>
          </form>
        </section>
        <section className="dashboard-section form-panel"><div className="section-heading"><div><h2>Ongeza somo</h2><p>Sajili masomo yanayofundishwa katika kila level.</p></div></div>
          <form className="form-grid" onSubmit={addSubject}>
            <label>Level<select value={subjectLevel} onChange={(e) => setSubjectLevel(e.target.value as "o_level" | "a_level")}><option value="o_level">O-Level</option><option value="a_level">A-Level</option></select></label>
            <label>Jina la somo<input required minLength={2} maxLength={100} value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Mfano: Mathematics" /></label>
            <label className="field-span">Code ya somo (si lazima)<input value={subjectCode} maxLength={30} onChange={(e) => setSubjectCode(e.target.value)} placeholder="Mfano: MAT" /></label>
            <div className="field-span"><button className="button button-dark" disabled={saving || !schoolId}>{saving ? "Inahifadhi…" : "Hifadhi somo"}</button></div>
          </form>
        </section>
      </div>
      <section className="dashboard-section"><div className="section-heading"><div><h2>Madarasa yaliyosajiliwa</h2><p>{classes.length} madarasa katika shule hii.</p></div></div>
        {classes.length ? <div className="academic-list">{classes.map((item) => <article className="academic-list-item" key={item.id}><div><strong>{item.level === "o_level" ? "O-Level" : "A-Level"} · Form {item.form_number} {item.stream_name}</strong><small>Mwaka wa masomo: {item.academic_year}</small></div><button className="button button-outline-dark" onClick={() => void removeClass(item)}>Futa</button></article>)}</div> : <div className="empty-state compact"><h3>Bado hakuna madarasa</h3><p>Tumia fomu hapo juu kuanza kusajili madarasa ya shule.</p></div>}
      </section>
      <section className="dashboard-section"><div className="section-heading"><div><h2>Masomo yaliyosajiliwa</h2><p>{subjects.length} masomo katika shule hii.</p></div></div>
        {subjects.length ? <div className="academic-list">{subjects.map((item) => <article className="academic-list-item" key={item.id}><div><strong>{item.subject_name}</strong><small>{item.level === "o_level" ? "O-Level" : "A-Level"}{item.subject_code ? ` · ${item.subject_code}` : ""} · {item.is_active ? "Active" : "Inactive"}</small></div><button className="button button-outline-dark" onClick={() => void toggleSubject(item)}>{item.is_active ? "Zima somo" : "Washa somo"}</button></article>)}</div> : <div className="empty-state compact"><h3>Bado hakuna masomo</h3><p>Sajili masomo ya O-Level na A-Level kwenye fomu hapo juu.</p></div>}
      </section>
    </>}
  </div></main></>;
}
