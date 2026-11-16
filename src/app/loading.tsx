export default function Loading() {
  return (
    <main className="system-state" aria-live="polite" aria-busy="true">
      <section className="system-state-card">
        <span className="system-state-kicker">TANGA SCHOOLS HUB</span>
        <div className="system-loader" aria-hidden="true" />
        <h1>Loading your page</h1>
        <p>Please wait while we prepare the information.</p>
      </section>
    </main>
  );
}
