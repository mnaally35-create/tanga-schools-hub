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
  return <html lang="en-TZ"><body><a className="skip-link" href="#main-content">Skip to main content</a><PwaRegister />{children}<a className="whatsapp-admin-button" href="https://wa.me/255710082844?text=Habari%20Admin%20Mkuu%20wa%20Tanga%20Schools%20Hub%2C%20naomba%20msaada." target="_blank" rel="noopener noreferrer" aria-label="Chat with the chief administrator on WhatsApp"><span className="whatsapp-admin-icon" aria-hidden="true">◉</span><span>Chat with Admin</span></a></body></html>;
}
