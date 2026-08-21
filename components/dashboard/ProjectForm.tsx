// components/dashboard/ProjectForm.tsx
"use client";

import type { Project } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ImageField from "@/components/dashboard/ImageField";
import ImageListField from "@/components/dashboard/ImageListField";
import FormNav from "@/components/dashboard/FormNav";

export type PendingImage = { field: string; filename: string; base64: string; list: boolean };

type Props = {
  draft: Project;
  onChange: (next: Project) => void;
  pendingImages: PendingImage[];
  onPendingImage: (img: PendingImage) => void;
};

const SECTIONS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "vi-tri", label: "Vị trí" },
  { id: "tien-ich", label: "Tiện ích" },
  { id: "mat-bang", label: "Mặt bằng" },
  { id: "gia-ban", label: "Giá bán" },
  { id: "phap-ly", label: "Pháp lý" },
  { id: "chinh-sach", label: "Chính sách" },
  { id: "dang-ky", label: "Đăng ký nhận tin" },
];

function FieldGroup({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 rounded-2xl border border-border-soft bg-surface p-6 scroll-mt-20">
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function ProjectForm({ draft, onChange, pendingImages, onPendingImage }: Props) {
  function setField<K extends keyof Project>(key: K, value: Project[K]) {
    onChange({ ...draft, [key]: value });
  }

  function setDescription(key: string, md: string) {
    onChange({ ...draft, descriptions: { ...(draft.descriptions ?? {}), [key]: md } });
  }

  function toggleHidden(id: string, hidden: boolean) {
    const current = new Set(draft.hidden_sections ?? []);
    if (hidden) current.add(id);
    else current.delete(id);
    setField("hidden_sections", [...current]);
  }

  return (
    <div className="space-y-6">
      <FormNav
        sections={[
          { id: "thong-tin-chung", label: "Thông tin chung" },
          ...SECTIONS.map((s) => ({ id: s.id, label: s.label })),
          { id: "an-hien", label: "Ẩn/hiện" },
        ]}
      />

      <FieldGroup id="thong-tin-chung" title="Thông tin chung">
        <TextField label="Tiêu đề" value={draft.title} onChange={(v) => setField("title", v)} />
        <TextField label="Vị trí (ngắn)" value={draft.location} onChange={(v) => setField("location", v)} />
        <TextField label="Chủ đầu tư" value={draft.developer} onChange={(v) => setField("developer", v)} />
        <TextField label="Khoảng giá hiển thị" value={draft.priceRange} onChange={(v) => setField("priceRange", v)} />
        <TextField label="Mô tả ngắn (excerpt)" value={draft.excerpt} onChange={(v) => setField("excerpt", v)} />
        <ImageField
          label="Ảnh đại diện"
          currentSrc={draft.hero_image}
          onPick={(f) => onPendingImage({ field: "hero_image", filename: f.filename, base64: f.base64, list: false })}
        />
      </FieldGroup>

      <FieldGroup id="tong-quan" title="Tổng quan">
        <RichTextEditor value={draft.descriptions?.["tong-quan"] ?? ""} onChange={(md) => setDescription("tong-quan", md)} />
        <ImageField
          label="Ảnh tổng quan"
          currentSrc={draft.overview_image}
          onPick={(f) => onPendingImage({ field: "overview_image", filename: f.filename, base64: f.base64, list: false })}
        />
      </FieldGroup>

      <FieldGroup id="vi-tri" title="Vị trí">
        <RichTextEditor value={draft.descriptions?.["vi-tri"] ?? ""} onChange={(md) => setDescription("vi-tri", md)} />
        <ImageField
          label="Ảnh vị trí"
          currentSrc={draft.location_image}
          onPick={(f) => onPendingImage({ field: "location_image", filename: f.filename, base64: f.base64, list: false })}
        />
      </FieldGroup>

      <FieldGroup id="tien-ich" title="Tiện ích">
        <RichTextEditor value={draft.descriptions?.["tien-ich"] ?? ""} onChange={(md) => setDescription("tien-ich", md)} />
        <ImageListField
          label="Ảnh tiện ích"
          currentSrcs={draft.amenities_images ?? []}
          onAdd={(f) => onPendingImage({ field: "amenities_images", filename: f.filename, base64: f.base64, list: true })}
        />
      </FieldGroup>

      <FieldGroup id="mat-bang" title="Mặt bằng">
        <ImageField
          label="Ảnh mặt bằng"
          currentSrc={draft.masterplan_image}
          onPick={(f) => onPendingImage({ field: "masterplan_image", filename: f.filename, base64: f.base64, list: false })}
        />
      </FieldGroup>

      <FieldGroup id="gia-ban" title="Giá bán">
        <RichTextEditor value={draft.descriptions?.["gia-ban"] ?? ""} onChange={(md) => setDescription("gia-ban", md)} />
        <div className="space-y-1.5">
          <Label>Chiết khấu</Label>
          <RichTextEditor value={draft.discount ?? ""} onChange={(v) => setField("discount", v)} />
        </div>
        <div className="space-y-1.5">
          <Label>Hỗ trợ ngân hàng</Label>
          <RichTextEditor value={draft.bank_support ?? ""} onChange={(v) => setField("bank_support", v)} />
        </div>
      </FieldGroup>

      <FieldGroup id="phap-ly" title="Pháp lý">
        <RichTextEditor value={draft.descriptions?.["phap-ly"] ?? ""} onChange={(md) => setDescription("phap-ly", md)} />
        <div className="space-y-1.5">
          <Label>Trạng thái pháp lý</Label>
          <RichTextEditor value={draft.legal_status ?? ""} onChange={(v) => setField("legal_status", v)} />
        </div>
        <TextField label="Ngày bàn giao" value={draft.handover_date ?? ""} onChange={(v) => setField("handover_date", v)} />
      </FieldGroup>

      <FieldGroup id="chinh-sach" title="Chính sách">
        <RichTextEditor value={draft.descriptions?.["chinh-sach"] ?? ""} onChange={(md) => setDescription("chinh-sach", md)} />
      </FieldGroup>

      <FieldGroup id="an-hien" title="Ẩn/hiện mục trên trang">
        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm text-navy-700">
              <Checkbox
                checked={(draft.hidden_sections ?? []).includes(s.id)}
                onCheckedChange={(checked) => toggleHidden(s.id, checked === true)}
              />
              Ẩn: {s.label}
            </label>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
