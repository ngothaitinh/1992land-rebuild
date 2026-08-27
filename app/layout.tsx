import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import Analytics from "@/components/Analytics";
import { legal, brand, contact } from "@/lib/site-config";

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
  weight: ["500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${brand.name} — ${brand.tagline}`,
    default: `${brand.name} — ${brand.tagline}`,
  },
  description:
    "1992 Land — Đơn vị tư vấn & phân phối dự án thuộc Công ty Cổ phần TPI Land. Tư vấn bất động sản tại HCMC, Vũng Tàu, Bình Dương, Long An, Đồng Nai.",
  keywords: [
    "bất động sản",
    "tư vấn bất động sản",
    "phân phối dự án",
    "TP. Hồ Chí Minh",
    "1992 Land",
    "TPI Land",
  ],
  authors: [{ name: legal.name, url: legal.url }],
  publisher: legal.name,
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

// Ba nút liên kết với nhau: pháp nhân TPI Land ← chuyên trang 1992 Land ← người phụ trách.
// `sameAs` trỏ về tpiland.com là mắt xích để Google nối domain này với pháp nhân đã có hồ sơ.
const schemaGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${brand.url}/#organization`,
      name: legal.name,
      legalName: legal.name,
      taxID: legal.taxId,
      vatID: legal.taxId,
      url: legal.url,
      telephone: legal.phoneIntl,
      email: legal.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: legal.addressStreet,
        addressLocality: legal.addressLocality,
        addressRegion: legal.addressRegion,
        addressCountry: "VN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: legal.geo.lat,
        longitude: legal.geo.lng,
      },
      hasMap: legal.mapUrl,
      sameAs: [legal.url],
    },
    {
      "@type": "RealEstateAgent",
      "@id": `${brand.url}/#brand`,
      name: brand.name,
      alternateName: `${brand.name} — ${legal.shortName}`,
      description: `${brand.role} thuộc ${legal.name}.`,
      url: brand.url,
      telephone: contact.phoneIntl,
      email: legal.email,
      parentOrganization: { "@id": `${brand.url}/#organization` },
      areaServed: ["TP HCM", "Vũng Tàu", "Bình Dương", "Long An", "Đồng Nai"],
      address: {
        "@type": "PostalAddress",
        streetAddress: legal.addressStreet,
        addressLocality: legal.addressLocality,
        addressRegion: legal.addressRegion,
        addressCountry: "VN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: legal.geo.lat,
        longitude: legal.geo.lng,
      },
      hasMap: legal.mapUrl,
      sameAs: [legal.url, contact.zalo],
    },
    {
      "@type": "Person",
      "@id": `${brand.url}/#nguoi-phu-trach`,
      name: contact.name,
      jobTitle: contact.jobTitle,
      telephone: contact.phoneIntl,
      worksFor: { "@id": `${brand.url}/#organization` },
      sameAs: [contact.zalo],
    },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </head>
      {/* pb-20 on mobile: chừa chỗ cho thanh CTA cố định (Zalo/Tư vấn/Gọi ngay, cao 75px).
          Đặt ở body chứ không phải main — Footer nằm ngoài main nên trước đây dòng cuối
          footer (MST, link Chính sách bảo mật) bị thanh CTA che mất, không bấm được. */}
      <body className="min-h-screen flex flex-col bg-bg text-ink antialiased pb-20 md:pb-0">
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
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
