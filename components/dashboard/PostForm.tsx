// components/dashboard/PostForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import FormNav from "@/components/dashboard/FormNav";

export type PostDraft = { meta: Record<string, string>; body: string };

type Props = {
  draft: PostDraft;
  onChange: (next: PostDraft) => void;
};

const SECTIONS = [
  { id: "thong-tin-chung", label: "Thông tin chung" },
  { id: "noi-dung", label: "Nội dung bài viết" },
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

export default function PostForm({ draft, onChange }: Props) {
  function setMeta(key: string, value: string) {
    onChange({ ...draft, meta: { ...draft.meta, [key]: value } });
  }

  return (
    <div className="space-y-6">
      <FormNav sections={SECTIONS} />

      <FieldGroup id="thong-tin-chung" title="Thông tin chung">
        <TextField label="Tiêu đề" value={draft.meta.title} onChange={(v) => setMeta("title", v)} />
        <TextField label="Slug URL" value={draft.meta.slug} onChange={(v) => setMeta("slug", v)} />
        <TextField label="Ngày đăng (YYYY-MM-DD)" value={draft.meta.date} onChange={(v) => setMeta("date", v)} />
        <TextField label="Chuyên mục" value={draft.meta.category} onChange={(v) => setMeta("category", v)} />
        <TextField label="Thời gian đọc" value={draft.meta.readTime} onChange={(v) => setMeta("readTime", v)} />
        <TextField label="Mô tả ngắn (excerpt)" value={draft.meta.excerpt} onChange={(v) => setMeta("excerpt", v)} />
        <TextField label="URL ảnh bìa" value={draft.meta.hero_image} onChange={(v) => setMeta("hero_image", v)} />
      </FieldGroup>

      <FieldGroup id="noi-dung" title="Nội dung bài viết">
        <RichTextEditor value={draft.body} onChange={(md) => onChange({ ...draft, body: md })} />
      </FieldGroup>
    </div>
  );
}
