"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Tanga Schools Hub error:", error); }, [error]);
  return (
    <html lang="en-TZ">
      <body>
        <main className="system-state">
          <section className="system-state-card">
            <span className="system-state-kicker">TANGA SCHOOLS HUB</span>
            <h1>Something went wrong</h1>
            <p>We could not load this page correctly. Please try again. Your account information remains protected.</p>
            <button className="button button-dark" onClick={() => reset()}>Try again</button>
            <a href="/" className="system-state-link">Return to homepage</a>
          </section>
        </main>
      </body>
    </html>
  );
}
