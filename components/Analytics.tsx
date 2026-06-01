"use client";

import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Helper — fire gtag event safely
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

// Fire Google Ads conversion
export function fireConversion(label?: string) {
  if (!GADS_ID) return;
  gtagEvent("conversion", {
    send_to: label ? `${GADS_ID}/${label}` : GADS_ID,
  });
}

export default function Analytics() {
  if (!GA4_ID && !GADS_ID && !META_PIXEL_ID) return null;

  return (
    <>
      {/* GA4 + Google Ads */}
      {(GA4_ID || GADS_ID) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID || GADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${GA4_ID ? `gtag('config', '${GA4_ID}');` : ""}
              ${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
