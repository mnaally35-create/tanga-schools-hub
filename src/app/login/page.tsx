"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";
import { messageFromError } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: platformRoles, error: roleError } = await supabase.from("platform_memberships").select("role").eq("user_id", data.user.id);
      if (roleError) throw roleError;
      const isPlatformAdmin = platformRoles?.some((item) => ["super_admin","regional_admin"].includes(item.role));
      router.replace(isPlatformAdmin ? "/admin" : "/dashboard"); router.refresh();
    } catch (err) { setError(messageFromError(err)); }
    finally { setBusy(false); }
  }
  return <><SiteHeader/><main className="auth-page"><div className="auth-card"><span className="eyebrow">SCHOOL PORTAL</span><h1>Welcome back</h1><p>Sign in to manage your school’s presence on TANGA SCHOOLS HUB.</p><form onSubmit={submit} className="form-stack"><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@school.ac.tz"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label>{error && <div className="alert alert-error">{error}</div>}<button className="button button-dark button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><div className="auth-bottom">New to the hub? <Link href="/register">Register your school</Link></div><Link className="back-link" href="/">← Back to homepage</Link></div></main></>;
}
