"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";
export default function ForgotPasswordPage(){
 const [email,setEmail]=useState("");const [phone,setPhone]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");const {data,error}=await createClient().functions.invoke("admin-actions",{body:{action:"request_password_reset",email,phone}});if(error)setError("Imeshindikana kutuma ombi. Jaribu tena baadaye.");else setMessage(data?.message||"Ombi limetumwa.");setBusy(false);}
 return <><SiteHeader/><main className="auth-page"><div className="auth-card"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Forgot password?</h1><p>Weka email na namba ya simu iliyosajiliwa kwenye profile yako. Admin Mkuu atahakiki ombi lako.</p><form onSubmit={submit} className="form-stack"><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>Registered phone number<input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+255…"/></label>{error&&<div className="alert alert-error">{error}</div>}{message&&<div className="alert alert-success">{message}</div>}<button className="button button-dark button-full" disabled={busy}>{busy?"Sending…":"Request password reset"}</button></form><div className="auth-bottom"><Link href="/login">Back to sign in</Link></div></div></main></>;
}