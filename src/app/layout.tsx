import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { PhoneShell } from "@/components/PhoneShell";
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
    statusBarStyle: "default",
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
        <PhoneShell>{children}</PhoneShell>
      </body>
    </html>
  );
}
