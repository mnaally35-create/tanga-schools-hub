"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";
import { messageFromError, slugify } from "@/lib/utils";

type Membership = { id: string; role: string; schools: { id: string; name: string; slug: string; status: string; school_type: string } | null };
type District = { id: string; name: string };
type Ward = { id: string; name: string };
export default function DashboardPage() {
  const router = useRouter();
  const [email,setEmail] = useState(""); const [isPlatformAdmin,setIsPlatformAdmin] = useState(false); const [memberships,setMemberships] = useState<Membership[]>([]); const [districts,setDistricts] = useState<District[]>([]); const [wards,setWards] = useState<Ward[]>([]); const [loading,setLoading] = useState(true); const [busy,setBusy] = useState(false); const [error,setError] = useState(""); const [success,setSuccess] = useState("");
  const [schoolName,setSchoolName] = useState(""); const [schoolType,setSchoolType] = useState("government"); const [registrationNumber,setRegistrationNumber] = useState(""); const [districtId,setDistrictId] = useState(""); const [ward,setWard] = useState(""); const [address,setAddress] = useState(""); const [phone,setPhone] = useState(""); const [schoolEmail,setSchoolEmail] = useState("");
  useEffect(() => { let active = true; const supabase = createClient();
    async function load() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace("/login"); return; } if (!active) return; setEmail(user.email ?? "");
      const [{ data, error }, { data: districtRows, error: districtError }, { data: platformRole, error: platformRoleError }] = await Promise.all([
        supabase.from("school_memberships").select("id,role,schools(id,name,slug,status,school_type)").eq("user_id", user.id).eq("is_active", true),
        supabase.from("districts").select("id,name").eq("region","Tanga").eq("is_active",true).order("name"),
        supabase.from("platform_memberships").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle()
      ]);
      if (!active) return; if (error) setError(error.message); else setMemberships((data ?? []) as unknown as Membership[]);
      if (districtError) setError(districtError.message); else setDistricts(districtRows ?? []);
      if (platformRoleError) setError(platformRoleError.message); else setIsPlatformAdmin(!!platformRole);
      setLoading(false);
    } load(); return () => { active = false; };
  },[router]);
  async function loadWards(nextDistrictId: string) { setDistrictId(nextDistrictId); setWard(""); setWards([]); if (!nextDistrictId) return; const { data, error } = await createClient().from("wards").select("id,name").eq("district_id", nextDistrictId).order("name"); if (error) setError(error.message); else setWards(data ?? []); }
  async function submitSchool(e: FormEvent) { e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Please sign in again.");
      const { data: adminRole } = await supabase.from("platform_memberships").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle();
      if (adminRole) throw new Error("Akaunti ya Admin Mkuu haiwezi kusajili shule au kupewa nafasi ya School Admin. Tumia akaunti tofauti ya shule.");
      const slug = slugify(schoolName); if (!slug) throw new Error("Enter a valid school name.");
      const selectedDistrict = districts.find((item) => item.id === districtId); if (!selectedDistrict) throw new Error("Please select a district.");
      const { data: school, error } = await supabase.from("schools").insert({ name: schoolName.trim(), slug, school_type: schoolType, registration_number: registrationNumber.trim() || null, district_id: districtId, ward: ward.trim() || null, address: [selectedDistrict.name, address.trim()].filter(Boolean).join(", ") || null, phone: phone.trim() || null, email: schoolEmail.trim() || null, created_by: user.id, status: "pending" }).select("id").single();
      if (error) throw error;
      const { error: membershipError } = await supabase.from("school_memberships").insert({ school_id: school.id, user_id: user.id, role: "school_admin", is_active: true });
      if (membershipError) throw new Error("School was submitted, but administrator access could not be linked. Please contact platform support: " + membershipError.message);
      setSuccess("School profile submitted. Your account is now linked as its School Admin. The school will appear in the public directory after verification.");
      setSchoolName(""); setRegistrationNumber(""); setDistrictId(""); setWard(""); setAddress(""); setPhone(""); setSchoolEmail("");
      const { data } = await supabase.from("school_memberships").select("id,role,schools(id,name,slug,status,school_type)").eq("user_id", user.id).eq("is_active", true); setMemberships((data ?? []) as unknown as Membership[]);
    } catch (err) { setError(messageFromError(err)); } finally { setBusy(false); }
  }
  async function signOut() { await createClient().auth.signOut(); router.push("/"); router.refresh(); }
  return <><SiteHeader/><main className="dashboard-page"><div className="container dashboard-container"><div className="dashboard-top"><div><span className="eyebrow">SCHOOL PORTAL</span><h1>Your dashboard</h1><p>Signed in as {email}</p></div><button className="button button-outline-dark" onClick={signOut}>Sign out</button></div>
    {loading ? <div className="empty-state">Loading your account…</div> : <><section className="dashboard-section"><div className="section-heading"><div><h2>Your school accounts</h2><p>Only schools assigned to your account are shown here.</p></div></div>{memberships.length ? <div className="dashboard-school-list">{memberships.map((m) => m.schools && <article className="dashboard-school" key={m.id}><div><h3>{m.schools.name}</h3><p>{m.role.replaceAll("_"," ")} · {m.schools.school_type}</p></div><span className={`status status-${m.schools.status}`}>{m.schools.status}</span><Link href={`/schools/${m.schools.slug}`} className="text-link">View profile →</Link></article>)}</div> : <div className="empty-state compact"><h3>No school profile linked yet</h3><p>Submit your school information below. Your account will become its initial school administrator.</p></div>}</section>
    {isPlatformAdmin ? <section className="dashboard-section form-panel admin-restriction"><div className="section-heading"><div><span className="eyebrow">PLATFORM ADMINISTRATOR</span><h2>School registration unavailable</h2><p>Akaunti ya Admin Mkuu imewekewa jukumu la kusimamia mfumo mzima. Haiwezi kusajili shule wala kupewa nafasi ya School Admin.</p></div></div></section> : <section className="dashboard-section form-panel"><div className="section-heading"><div><span className="eyebrow">SCHOOL ONBOARDING</span><h2>Submit a school profile</h2><p>Profiles are private until reviewed and verified by the platform team.</p></div></div><form onSubmit={submitSchool} className="form-grid"><label className="field-span">Official school name<input required value={schoolName} onChange={e=>setSchoolName(e.target.value)} placeholder="e.g. Example Secondary School"/></label><label>Ownership<select value={schoolType} onChange={e=>setSchoolType(e.target.value)}><option value="government">Government</option><option value="private">Private</option></select></label><label>School registration number<input value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} placeholder="If available"/></label><label>District / council<select required value={districtId} onChange={e=>{void loadWards(e.target.value);}}><option value="">Select district / council</option>{districts.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Ward / Kata<select required value={ward} onChange={e=>setWard(e.target.value)} disabled={!districtId || wards.length===0}><option value="">{!districtId ? "Select district first" : wards.length ? "Select ward" : "Loading / no wards available"}</option>{wards.map((item)=><option key={item.id} value={item.name}>{item.name}</option>)}</select></label><p className="field-span data-attribution">Administrative ward data: <a href="https://github.com/open-admin-data/tanzania-administrative-divisions" target="_blank" rel="noreferrer">Open Admin Data Tanzania</a> (CC BY 4.0).</p><label className="field-span">Street / postal address<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="School location or postal address"/></label><label>School phone<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+255…"/></label><label>School email<input type="email" value={schoolEmail} onChange={e=>setSchoolEmail(e.target.value)} placeholder="info@school.ac.tz"/></label>{error && <div className="alert alert-error field-span">{error}</div>}{success && <div className="alert alert-success field-span">{success}</div>}<div className="field-span"><button className="button button-dark" disabled={busy}>{busy ? "Submitting…" : "Submit school for verification"}</button></div></form></section>}</>}
    <div className="dashboard-help"><strong>Need help?</strong><p>Contact the TANGA SCHOOLS HUB platform team if you need to correct a submitted school profile or request administrator access.</p></div>
  </div></main></>;
}
