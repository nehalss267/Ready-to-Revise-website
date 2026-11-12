import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Ready-To-Revise — Revise smarter, remember more",
    template: "%s — Ready-To-Revise",
  },
  description:
    "Behavior-driven spaced repetition that adapts to how you actually perform. Upload materials, revise with smart MCQ sessions, and track recall.",
};

export const viewport: Viewport = {
  themeColor: "#064663",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
