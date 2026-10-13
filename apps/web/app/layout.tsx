import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matchwork — Job Match Analyser",
  description: "See how your experience maps to the role, and what to strengthen next.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
