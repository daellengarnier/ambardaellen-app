import type { Metadata, Viewport } from "next";
import { AuthGate } from "@/components/AuthGate";
import "@fontsource-variable/manrope";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";

// Schriften liegen im Paket (Fontsource), nicht bei Google: der Build
// braucht so kein Netz, und die vietnamesischen Zeichen sind dabei.


export const metadata: Metadata = {
  title: "Life-App",
  description: "Todos, Ziele und Alltag von Alain, verbunden mit Jarvis.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
