import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

// Load Inter font via Next.js font optimization
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "zwerte | Lottery System Works Number Generator & Analytics",
  description: "A world-class, enterprise-grade lottery number generator featuring advanced statistical analytics, real-time probability calculations, Monte Carlo simulations, and premium UI/UX design. Generate optimized lottery combinations with intelligent pattern analysis.",
  keywords: [
    "lottery number generator",
    "lottery analytics",
    "probability calculator",
    "lottery odds calculator",
    "random number generator",
    "lottery simulation",
    "Monte Carlo simulation",
    "statistical analysis",
    "lottery strategy",
    "number picker",
    "lottery app",
    "zwerte",
    "enterprise lottery",
    "lottery probability",
    "winning numbers",
    "lottery combination generator"
  ],
  authors: [{ name: "Ramon Logan Jr.", url: "https://ramonloganjr.com" }],
  creator: "Ramon Logan Jr.",
  publisher: "Ramon Logan Jr.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "zwerte | Lottery System Works Number Generator",
    description: "World-class lottery number generator with advanced analytics, real-time probability calculations, and Monte Carlo simulations.",
    siteName: "zwerte",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "zwerte - Lottery System Works Number Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "zwerte | Lottery System Works Number Generator",
    description: "World-class lottery number generator with advanced analytics and real-time probability calculations.",
    creator: "@ramonloganjr",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  category: "Technology",
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
