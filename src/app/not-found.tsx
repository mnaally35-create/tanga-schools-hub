import Link from "next/link";

export default function NotFound() {
  return (
    <main className="system-state">
      <section className="system-state-card">
        <span className="system-state-kicker">TANGA SCHOOLS HUB</span>
        <h1>Page not found</h1>
        <p>The page you are looking for may have moved, or the address may be incorrect.</p>
        <Link className="button button-dark" href="/">Go to homepage</Link>
        <Link className="system-state-link" href="/schools">Explore schools</Link>
      </section>
    </main>
  );
}
