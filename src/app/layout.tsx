import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life-App",
  description: "Todos, Ziele und Alltag von Alain, verbunden mit Jarvis.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  appleWebApp: {
    capable: true,
    title: "Life-App",
    // black-translucent: iOS legt die Status-Bar transparent über die
    // App, der Hintergrund läuft bis ganz an den oberen Rand.
    // Der Status-Bar-Text bleibt schwarz und ist auf Cream gut lesbar.
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#EDF0F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
