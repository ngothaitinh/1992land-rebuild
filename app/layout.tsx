import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";

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

export const metadata: Metadata = {
  title: {
    template: "%s | 1992 Land — BĐS Thủ Đức",
    default: "1992 Land — Giá Trị Kiến Tạo Lòng Tin",
  },
  description:
    "1992 Land — Chuyên môi giới bất động sản tại HCMC, Vũng Tàu, Bình Dương, Long An, Đồng Nai. Uy tín — Chuyên nghiệp — Tận tâm.",
  keywords: ["bất động sản", "môi giới BĐS", "Thủ Đức", "HCMC", "1992 Land"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://1992land.com",
    siteName: "1992 Land",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  metadataBase: new URL("https://1992land.com"),
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "1992 Land",
  url: "https://1992land.com",
  telephone: "0909474123",
  email: "nguyenhuutho911@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "17 Trần Quý Kiên",
    addressLocality: "Bình Trưng Tây, TP. Thủ Đức",
    addressRegion: "Hồ Chí Minh",
    addressCountry: "VN",
  },
  sameAs: [
    "https://zalo.me/0909474123",
    "https://m.me/165126330021000",
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
      className={`${beVietnam.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-ink antialiased">
        <Header />
        {/* pb-16 on mobile for FloatingCTA bottom bar */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
