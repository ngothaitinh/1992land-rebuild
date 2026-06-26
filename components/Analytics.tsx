"use client";

import Script from "next/script";

const GTM_ID = "GTM-PSC9KR55";

// Helper — fire gtag event safely (works when GTM loads GA4/Google Ads tags)
export function gtagEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined") return;
  if (!(window as unknown as Record<string, unknown>).gtag) return;
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
    "event",
    eventName,
    params
  );
}

// Fire Google Ads conversion via dataLayer
export function fireConversion(conversionLabel?: string) {
  if (typeof window === "undefined") return;
  const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (!dl) return;
  dl.push({ event: "conversion", conversionLabel });
}

export default function Analytics() {
  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}
    </Script>
  );
}
