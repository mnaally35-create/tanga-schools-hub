"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PortalHeader({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return <header className="site-header portal-header"><div className="nav-wrap">
    <Link href={admin ? "/admin" : "/dashboard"} className="brand" aria-label="Tanga Schools Hub portal">
      <span className="brand-mark">T</span><span><strong>TANGA SCHOOLS</strong><small>PORTAL</small></span>
    </Link>
    <nav className="main-nav portal-nav"><Link href={admin ? "/admin" : "/dashboard"}>{admin ? "Overview" : "Dashboard"}</Link>{admin && <Link href="/admin">School requests</Link>}<Link href="/profile">My profile</Link></nav>
    <div className="nav-actions"><span className="portal-role">{admin ? "PLATFORM ADMIN" : "SCHOOL PORTAL"}</span><button className="button button-outline-dark button-small" onClick={signOut}>Sign out</button></div>
  </div></header>;
}
