import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import Analytics from "@/components/Analytics";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 1992 Land — BĐS Thủ Đức",
    default: "1992 Land — Giá Trị Kiến Tạo Lòng Tin",
  },
  description:
    "1992 Land — Chuyên môi giới bất động sản tại HCMC, Vũng Tàu, Bình Dương, Long An, Đồng Nai. Uy tín — Chuyên nghiệp — Tận tâm.",
  keywords: ["bất động sản", "môi giới BĐS", "Thủ Đức", "HCMC", "1992 Land"],
  icons: {
    icon: [{ url: "/images/logo.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/images/logo.png", sizes: "512x512" }],
    shortcut: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://1992land.com",
    siteName: "1992 Land",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  metadataBase: new URL("https://1992land.com"),
  alternates: {
    canonical: "https://1992land.com",
    languages: { "vi-VN": "https://1992land.com" },
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "1992 Land",
  url: "https://1992land.com",
  founder: "Nguyễn Hữu Thọ",
  telephone: "+84909474123",
  email: "nguyenhuutho911@gmail.com",
  areaServed: ["TP HCM", "Vũng Tàu", "Bình Dương", "Long An", "Đồng Nai"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "17 Trần Quý Kiên",
    addressLocality: "Bình Trưng Tây, TP. Thủ Đức",
    addressRegion: "Hồ Chí Minh",
    addressCountry: "VN",
  },
  sameAs: [
    "https://zalo.me/0909474123",
    "https://www.facebook.com/nguyenhuutho911",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${inter.variable} ${fraunces.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-ink antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PSC9KR55"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Analytics />
        <Header />
        {/* pb-16 on mobile for FloatingCTA bottom bar */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
