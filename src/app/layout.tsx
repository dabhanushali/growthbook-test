import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GrowthBookProvider } from "@/components/GrowthBookProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { getGrowthBookFeatures, getServerAttributes } from "@/lib/growthbook";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrowthBook + PostHog Experimentation POC",
  description: "Advanced Feature Flags, A/B Testing, and Edge Personalization POC",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch feature flags and request attributes server-side
  const features = await getGrowthBookFeatures();
  const attributes = await getServerAttributes();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <PostHogProvider>
          <GrowthBookProvider initialFeatures={features} initialAttributes={attributes}>
            {children}
          </GrowthBookProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
