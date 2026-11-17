"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const schoolLinks = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/news", "News & announcements"],
  ["/dashboard/academics", "Academic setup"],
  ["/dashboard/teachers", "Teachers"],
  ["/dashboard/learning", "Learning materials"],
  ["/dashboard/materials-review", "Review materials"],
  ["/dashboard/exams", "Exams"],
  ["/dashboard/students", "Students"],
  ["/dashboard/results", "Results"],
];
const adminLinks = [
  ["/admin", "School requests"],
  ["/admin/security", "Security & moderators"],
  ["/admin/schools", "School administrators"],
];

export function PortalHeader({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  const links = admin ? adminLinks : schoolLinks;
  return <div className="portal-layout">
    <aside className="portal-sidebar" aria-label="Portal navigation">
      <Link href={admin ? "/admin" : "/dashboard"} className="portal-brand">
        <span className="brand-mark">T</span><span><strong>TANGA SCHOOLS</strong><small>PORTAL</small></span>
      </Link>
      <div className="portal-sidebar-label">{admin ? "PLATFORM" : "SCHOOL MENU"}</div>
      <nav className="portal-side-nav">
        {links.map(([href,label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={pathname === href ? "active" : ""}>{label}</Link>)}
      </nav>
      <div className="portal-sidebar-bottom">
        <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>My profile</Link>
        <button type="button" onClick={signOut}>Sign out</button>
      </div>
    </aside>
    <header className="portal-mobile-top">
      <Link href={admin ? "/admin" : "/dashboard"} className="brand"><span className="brand-mark">T</span><span><strong>TANGA SCHOOLS</strong><small>PORTAL</small></span></Link>
      <span className="portal-role">{admin ? "PLATFORM ADMIN" : "SCHOOL PORTAL"}</span>
    </header>
  </div>;
}
