import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Laukik Pawar | Computer Science Graduate Student",
    template: "%s | Laukik Pawar",
  },
  description:
    "Explore Laukik Pawar's software, data engineering, cloud, and machine learning projects, technical skills, experience, and certifications.",
  alternates: {
  canonical: "/",
},
    applicationName: "Laukik Pawar Portfolio",
  authors: [{ name: "Laukik Pawar" }],
  openGraph: {
    type: "website",
    title: "Laukik Pawar | Portfolio",
    description:
      "Explore my software, data engineering, cloud, and machine learning projects and experience.",
    siteName: "Laukik Pawar Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laukik Pawar | Portfolio",
    description:
      "Explore my software, data engineering, cloud, and machine learning projects and experience.",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
