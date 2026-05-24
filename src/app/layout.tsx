import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ambar & Dällen",
  description: "Unser gemeinsamer Küchentisch — digital.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  appleWebApp: {
    capable: true,
    title: "Ambar & Dällen",
    // black-translucent: iOS legt die Status-Bar transparent über die
    // App, der Atmosphere-Hintergrund läuft bis ganz an den oberen Rand.
    // Der Status-Bar-Text bleibt schwarz und ist auf Cream gut lesbar.
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#EFE6D3",
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
    <html lang="de" className={`${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
