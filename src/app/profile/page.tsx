"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [email,setEmail] = useState("");
  const [fullName,setFullName] = useState("");
  const [phone,setPhone] = useState("");
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  useEffect(()=>{ let live=true; (async()=>{ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user){router.replace("/login");return;} const {data}=await supabase.from("profiles").select("full_name,phone").eq("id",user.id).maybeSingle(); if(!live)return; setEmail(user.email??""); setFullName(data?.full_name??""); setPhone(data?.phone??""); setLoading(false); })(); return ()=>{live=false}; },[router]);
  async function save(e:FormEvent){e.preventDefault();setSaving(true);setError("");setMessage("");const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}const {error}=await supabase.from("profiles").upsert({id:user.id,full_name:fullName.trim(),phone:phone.trim()||null,updated_at:new Date().toISOString()},{onConflict:"id"});if(error)setError(error.message);else setMessage("Profile details saved successfully.");setSaving(false);}
  return <><SiteHeader/><main className="dashboard-page"><div className="container dashboard-container"><div className="dashboard-top"><div><span className="eyebrow">ACCOUNT SETTINGS</span><h1>My profile</h1><p>Manage your personal account information.</p></div><Link className="button button-outline-dark" href="/dashboard">Back to dashboard</Link></div>{loading?<div className="empty-state">Loading profile…</div>:<section className="dashboard-section form-panel"><form className="form-grid" onSubmit={save}><label className="field-span">Email address<input value={email} readOnly disabled/></label><label className="field-span">Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label><label className="field-span">Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+255…"/></label>{error&&<div className="alert alert-error field-span">{error}</div>}{message&&<div className="alert alert-success field-span">{message}</div>}<div className="field-span"><button className="button button-dark" disabled={saving}>{saving?"Saving…":"Save profile"}</button></div></form></section>}</div></main></>;
}
