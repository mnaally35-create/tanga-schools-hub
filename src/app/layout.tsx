import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "TANGA SCHOOLS HUB | One Region. All Schools.",
  description: "Discover verified secondary schools, education news and opportunities across Tanga Region, Tanzania.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tanga Schools Hub" },
};
export const viewport: Viewport = { themeColor: "#123d31", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister />{children}</body></html>;
}
