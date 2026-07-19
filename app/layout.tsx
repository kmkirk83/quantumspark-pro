import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuantumSpark Mission Control",
  description: "Platform readiness dashboard for QuantumSpark Pro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">{children}</body>
    </html>
  );
}
