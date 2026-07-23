// components/dashboard/DashboardProjectEditor.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/data";
import { getDashboardProject, saveDashboardProject, undoDashboardSave } from "@/lib/dashboard-api.mjs";
import { buildPatch } from "@/lib/dashboard-patch.mjs";
import ProjectForm, { type PendingImage } from "@/components/dashboard/ProjectForm";
import ProjectDetailView from "@/components/ProjectDetailView";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "https://api.1992land.com";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; original: Project; draft: Project };

export default function DashboardProjectEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastUndoKey, setLastUndoKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { project } = await getDashboardProject(API_BASE, slug);
      setState({ status: "ready", original: project, draft: project });
      setPendingImages([]);
    } catch (e) {
      if (e instanceof Error && e.message === "unauthorized") {
        router.push(`/dashboard/login/?next=/dashboard/du-an/${slug}/`);
        return;
      }
      setState({ status: "error", message: e instanceof Error ? e.message : "Lỗi tải dữ liệu" });
    }
  }, [slug, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") return <div className="p-8 text-navy-600">Đang tải...</div>;
  if (state.status === "error") return <div className="p-8 text-red-600">Lỗi: {state.message}</div>;

  const { original, draft } = state;

  async function onSave() {
    const patch = buildPatch(original, draft, pendingImages);
    if (!patch) {
      setBanner("Không có thay đổi để lưu.");
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      const { undoKey } = await saveDashboardProject(API_BASE, slug, patch);
      setLastUndoKey(undoKey);
      setBanner("Đã lưu. Web cập nhật sau khoảng 8 phút.");
      await load();
    } catch (e) {
      setBanner(`Lỗi khi lưu: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function onUndo() {
    if (!lastUndoKey) return;
    setSaving(true);
    setBanner(null);
    try {
      await undoDashboardSave(API_BASE, lastUndoKey);
      setLastUndoKey(null);
      setBanner("Đã hoàn tác lần lưu gần nhất.");
      await load();
    } catch (e) {
      setBanner(`Không thể hoàn tác: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-soft bg-white px-6 py-3">
        <div>
          <h1 className="text-lg font-bold text-navy-900">{draft.title}</h1>
          {banner && <p className="text-sm text-navy-600">{banner}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!lastUndoKey || saving} onClick={onUndo}>
            Hoàn tác lần lưu gần nhất
          </Button>
          <Button disabled={saving} onClick={onSave}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
          <ProjectForm
            draft={draft}
            onChange={(next) => setState({ status: "ready", original, draft: next })}
            pendingImages={pendingImages}
            onPendingImage={(img) => setPendingImages((prev) => [...prev, img])}
          />
        </div>
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-border-soft bg-white">
          <ProjectDetailView project={draft} relatedProjects={[]} relatedPosts={[]} />
        </div>
      </div>
    </div>
  );
}
