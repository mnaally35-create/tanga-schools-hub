import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="Tanga Schools Hub home">
          <span className="brand-mark">T</span>
          <span><strong>TANGA SCHOOLS</strong><small>HUB</small></span>
        </Link>
        <nav className="main-nav">
          <Link href="/#home">Home</Link><Link href="/#schools">Schools</Link><Link href="/#districts">Districts</Link><Link href="/#news">Education News</Link><Link href="/#about">About</Link>
        </nav>
        <div className="nav-actions"><Link className="button button-dark button-small" href="/login">School Login</Link><Link className="mobile-menu-link" href="/dashboard">Dashboard</Link></div>
      </div>
    </header>
  );
}
