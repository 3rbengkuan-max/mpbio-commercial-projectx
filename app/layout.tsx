import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { NavLinks } from "./components/nav-links";

export const metadata: Metadata = {
  title: "MPbio Commercial Intelligence",
  description:
    "Shared workspace for capturing life-science market signals and turning them into tracked projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3.5">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-neutral-900 text-xs font-bold text-white">
                MP
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Commercial Intelligence
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4">
          <p className="text-xs text-neutral-400">
            Shared team workspace — every signal, project, and activity is
            visible to the whole commercial team.
          </p>
        </footer>
      </body>
    </html>
  );
}
