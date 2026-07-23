// components/dashboard/ImageField.tsx
"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Picked = { filename: string; base64: string };

function toBase64Payload(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx === -1 ? dataUrl : dataUrl.slice(idx + 1);
}

function extFromMime(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function ImageField({ label, currentSrc, onPick }: { label: string; currentSrc?: string; onPick: (file: Picked) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const filename = `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extFromMime(file)}`;
      onPick({ filename, base64: toBase64Payload(String(reader.result)) });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {currentSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentSrc} alt={label} className="h-16 w-24 rounded-lg border border-border-soft object-cover" />
        )}
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          {currentSrc ? "Đổi ảnh" : "Chọn ảnh"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    </div>
  );
}
