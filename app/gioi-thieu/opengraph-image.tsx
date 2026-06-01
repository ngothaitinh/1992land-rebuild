import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Giới thiệu 1992 Land — Nguyễn Hữu Thọ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ background: "linear-gradient(135deg, #071121 0%, #0D1E38 60%, #1E3A60 100%)", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: "sans-serif", padding: "60px 72px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, transparent, #C49730, transparent)", display: "flex" }} />
        <div style={{ fontSize: 14, color: "#C49730", letterSpacing: "0.4em", marginBottom: 24, display: "flex" }}>· 1992 ·  Về chúng tôi</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, marginBottom: 8, display: "flex" }}>Nguyễn Hữu Thọ</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#C49730", lineHeight: 1.15, marginBottom: 24, display: "flex" }}>Nhà sáng lập · 1992 Land</div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 48, display: "flex" }}>5+ năm kinh nghiệm · 500+ khách hàng tin tưởng · Thủ Đức, TP.HCM</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#FFF", letterSpacing: "0.2em" }}>1992</div>
              <div style={{ fontSize: 11, color: "#C49730", letterSpacing: "0.4em" }}>LAND</div>
            </div>
            <div style={{ width: 2, height: 40, background: "#C49730", display: "flex" }} />
          </div>
          <div style={{ fontSize: 16, color: "#C49730", display: "flex" }}>0909 474 123 · 1992land.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
