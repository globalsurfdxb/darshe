import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DarShe admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
