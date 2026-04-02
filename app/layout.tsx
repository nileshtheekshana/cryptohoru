import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { TimezoneProvider } from "@/components/TimezoneProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptohoru.com'),
  title: {
    default: "CryptoHoru - Crypto Airdrops, AMA, Giveaways & News",
    template: "%s | CryptoHoru"
  },
  description: "Discover the latest crypto airdrops, participate in AMA sessions, win giveaways, explore P2E games, and stay updated with cryptocurrency news. Your ultimate crypto hub.",
  keywords: [
    "crypto airdrops",
    "cryptocurrency",
    "bitcoin airdrops",
    "ethereum airdrops",
    "free crypto",
    "crypto giveaways",
    "AMA sessions",
    "crypto news",
    "blockchain",
    "DeFi",
    "NFT",
    "P2E games",
    "play to earn",
    "crypto rewards",
    "token distribution"
  ],
  authors: [{ name: "CryptoHoru" }],
  creator: "CryptoHoru",
  publisher: "CryptoHoru",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cryptohoru.com",
    title: "CryptoHoru - Crypto Airdrops, AMA, Giveaways & News",
    description: "Discover the latest crypto airdrops, participate in AMA sessions, win giveaways, explore P2E games, and stay updated with cryptocurrency news.",
    siteName: "CryptoHoru",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CryptoHoru - Your Crypto Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoHoru - Crypto Airdrops, AMA, Giveaways & News",
    description: "Discover the latest crypto airdrops, participate in AMA sessions, win giveaways, explore P2E games, and stay updated with cryptocurrency news.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://cryptohoru.com',
    types: {
      'application/rss+xml': 'https://cryptohoru.com/feed.xml',
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with your Google Search Console verification code
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CryptoHoru",
    "description": "Discover the latest crypto airdrops, participate in AMA sessions, win giveaways, explore P2E games, and stay updated with cryptocurrency news",
    "url": "https://cryptohoru.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cryptohoru.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <TimezoneProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </TimezoneProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

