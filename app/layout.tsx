import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumSpark Pro Trading Cockpit",
  description: "Modern AI trading dashboard for portfolio insight, signals, and operational trust.",
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
