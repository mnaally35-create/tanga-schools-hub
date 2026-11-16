"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";
import { messageFromError } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [name,setName] = useState(""); const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [busy,setBusy] = useState(false); const [error,setError] = useState(""); const [notice,setNotice] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      if (data.session) { router.push("/dashboard"); router.refresh(); }
      else setNotice("Account created. Check your email to confirm the address, then sign in to submit your school profile for verification.");
    } catch (err) { setError(messageFromError(err)); }
    finally { setBusy(false); }
  }
  return <><SiteHeader/><main className="auth-page"><div className="auth-card auth-card-wide"><span className="eyebrow">JOIN THE NETWORK</span><h1>Register your school account</h1><p>Create an administrator account first. After signing in, you can submit your school profile for review.</p><form onSubmit={submit} className="form-stack"><label>Administrator full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label><label>Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@school.ac.tz"/></label><label>Password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>{error && <div className="alert alert-error">{error}</div>}{notice && <div className="alert alert-success">{notice}</div>}<button className="button button-dark button-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button></form><div className="auth-bottom">Already registered? <Link href="/login">Sign in</Link></div><Link className="back-link" href="/">← Back to homepage</Link></div></main></>;
}
