import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
import "./quality.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ShelterGrid | GenLayer",
  description: "Coordinate capacity, supplies, accessibility, incidents, and activation readiness.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
