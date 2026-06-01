import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "1992 Land — Giá Trị Kiến Tạo Lòng Tin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #071121 0%, #0D1E38 50%, #1E3A60 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Gold accent line */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 2, height: 80, background: "linear-gradient(to bottom, transparent, #C49730)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.2em" }}>1992</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#C49730", letterSpacing: "0.4em" }}>LAND</span>
          </div>
          <div style={{ width: 2, height: 60, background: "#C49730" }} />
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#FFFFFF", marginBottom: 16, textAlign: "center" }}>
          Giá Trị Kiến Tạo Lòng Tin
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
          Môi giới BĐS chuyên nghiệp · TP.HCM · Vũng Tàu · Bình Dương
        </div>

        {/* Gold divider */}
        <div style={{ width: 80, height: 3, background: "#C49730", borderRadius: 2, marginTop: 32 }} />

        {/* Contact */}
        <div style={{ position: "absolute", bottom: 40, fontSize: 18, color: "#C49730" }}>
          0909 474 123 · 1992land.com
        </div>
      </div>
    ),
    { ...size }
  );
}
