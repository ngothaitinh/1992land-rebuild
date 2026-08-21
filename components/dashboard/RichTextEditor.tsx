// components/dashboard/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown-html.mjs";

type Props = {
  value: string;
  onChange: (md: string) => void;
  onImageInsert?: (dataUrl: string) => void;
};

function ToolbarButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-navy-900 text-white" : "bg-surface text-navy-700 hover:bg-navy-50"
      } border border-border-soft`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, onImageInsert }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedMd = useRef(value);

  const editor = useEditor({
    extensions: [
      // Chỉ bật đúng 10 cấu trúc của hợp đồng định dạng (spec §5). StarterKit mặc định
      // còn có code, codeBlock, horizontalRule, strike, hardBreak — tắt hết, vì BLOCK_RE
      // (lib/markdown-html.mjs) không hiểu các thẻ đó và sẽ nuốt mất nội dung khi lưu.
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        hardBreak: false,
      }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: markdownToHtml(value),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const md = htmlToMarkdown(editor.getHTML());
      lastEmittedMd.current = md;
      onChange(md);
    },
  });

  useEffect(() => {
    if (!editor || value === lastEmittedMd.current) return;
    editor.commands.setContent(markdownToHtml(value));
    lastEmittedMd.current = value;
  }, [value, editor]);

  if (!editor) return null;

  function insertImage() {
    fileInputRef.current?.click();
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      onImageInsert?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function setLink() {
    const url = window.prompt("Đường dẫn liên kết:");
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="rounded-xl border border-border-soft bg-surface">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 rounded-t-xl border-b border-border-soft bg-surface p-2">
        <ToolbarButton label="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Tiêu đề H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Tiêu đề H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton label="Danh sách gạch đầu dòng" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton label="Danh sách đánh số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton label="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</ToolbarButton>
        <ToolbarButton label="Chèn liên kết" onClick={setLink}>Link</ToolbarButton>
        <ToolbarButton label="Chèn ảnh" onClick={insertImage}>Ảnh</ToolbarButton>
        <ToolbarButton label="Xoá định dạng" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>Xoá định dạng</ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
      </div>
      <EditorContent
        editor={editor}
        className="max-w-none p-4 text-[15px] leading-[1.85] text-ink [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:tracking-tight [&_blockquote]:border-l-4 [&_blockquote]:border-gold-500 [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:bg-gold-50 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:font-medium [&_blockquote]:text-navy-800 [&_blockquote]:leading-relaxed"
      />
    </div>
  );
}
