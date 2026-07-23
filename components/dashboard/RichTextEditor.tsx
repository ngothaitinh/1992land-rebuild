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
      StarterKit.configure({ heading: { levels: [2, 3] } }),
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

  // If the parent replaces `value` from outside (e.g. switching fields/projects),
  // resync the editor content — but skip when the change originated from our own onUpdate.
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
      <div className="flex flex-wrap gap-1.5 border-b border-border-soft p-2">
        <ToolbarButton label="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Tiêu đề H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Tiêu đề H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton label="Danh sách gạch đầu dòng" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton label="Danh sách đánh số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton label="Chèn liên kết" onClick={setLink}>Link</ToolbarButton>
        <ToolbarButton label="Chèn ảnh" onClick={insertImage}>Ảnh</ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
      </div>
      <EditorContent editor={editor} className="prose-sm max-w-none p-4 [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none" />
    </div>
  );
}
