import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASOMIDDIN AI — Personal Assistant",
  description: "LMS companion, voice assistant and intelligent schedule manager.",
  applicationName: "ASOMIDDIN AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
