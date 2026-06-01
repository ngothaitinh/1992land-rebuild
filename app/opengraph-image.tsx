import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "1992 Land — Giá Trị Kiến Tạo Lòng Tin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ background: "linear-gradient(135deg, #071121 0%, #0D1E38 50%, #1E3A60 100%)", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, transparent, #C49730, transparent)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: "#FFF", letterSpacing: "0.2em" }}>1992</div>
            <div style={{ fontSize: 16, color: "#C49730", letterSpacing: "0.5em" }}>LAND</div>
          </div>
          <div style={{ width: 2, height: 64, background: "#C49730", display: "flex" }} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#FFF", marginBottom: 16, display: "flex" }}>Giá Trị Kiến Tạo Lòng Tin</div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 40, display: "flex" }}>Môi giới BĐS chuyên nghiệp · TP.HCM</div>
        <div style={{ width: 80, height: 3, background: "#C49730", borderRadius: 2, display: "flex" }} />
        <div style={{ position: "absolute", bottom: 40, fontSize: 16, color: "#C49730", display: "flex" }}>0909 474 123 · 1992land.com</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, transparent, #C49730, transparent)", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
