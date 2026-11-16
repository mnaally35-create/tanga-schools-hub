import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const siteUrl = "https://tanga-schools-hub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tanga Schools Hub | One Region. All Schools.",
    template: "%s | Tanga Schools Hub",
  },
  description: "Discover verified secondary schools, explore education opportunities and connect with the education community across Tanga Region, Tanzania.",
  applicationName: "Tanga Schools Hub",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Tanga Schools Hub",
    title: "Tanga Schools Hub | One Region. All Schools.",
    description: "A connected digital directory for secondary schools and education opportunities across Tanga Region, Tanzania.",
    locale: "en_TZ",
  },
  twitter: {
    card: "summary",
    title: "Tanga Schools Hub",
    description: "Discover verified schools and education opportunities across Tanga Region, Tanzania.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Tanga Schools Hub" },
};

export const viewport: Viewport = {
  themeColor: "#102a3b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-TZ"><body><a className="skip-link" href="#main-content">Skip to main content</a><PwaRegister />{children}<a className="whatsapp-admin-button" href="https://wa.me/255710082844?text=Habari%20Admin%20Mkuu%20wa%20Tanga%20Schools%20Hub%2C%20naomba%20msaada." target="_blank" rel="noopener noreferrer" aria-label="Chat with the chief administrator on WhatsApp"><span className="whatsapp-admin-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.5-8.42ZM12.09 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98.99-3.64-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.45-9.91 9.92-9.91a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.44-7.43c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.81.38-.28.3-1.06 1.03-1.06 2.51s1.09 2.91 1.24 3.11c.15.2 2.14 3.27 5.19 4.58.73.32 1.3.51 1.74.65.73.23 1.4.2 1.92.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z"/></svg></span><span>Chat with Admin</span></a></body></html>;
}
