import Link from "next/link";

export function PortalHeader({ admin = false }: { admin?: boolean }) {
  return <header className="site-header portal-header"><div className="nav-wrap">
    <Link href={admin ? "/admin" : "/dashboard"} className="brand" aria-label="Tanga Schools Hub portal">
      <span className="brand-mark">T</span><span><strong>TANGA SCHOOLS</strong><small>PORTAL</small></span>
    </Link>
    <nav className="main-nav portal-nav"><Link href={admin ? "/admin" : "/dashboard"}>{admin ? "Overview" : "Dashboard"}</Link>{admin && <Link href="/admin">School requests</Link>}<Link href="/profile">My profile</Link><Link href="/">Public website</Link></nav>
    <div className="nav-actions"><span className="portal-role">{admin ? "PLATFORM ADMIN" : "SCHOOL PORTAL"}</span></div>
  </div></header>;
}
