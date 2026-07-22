import { test } from "node:test";
import assert from "node:assert/strict";
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";

function makeProject(overrides = {}) {
  return {
    slug: "demo-project", title: "Demo", location: "Q9", priceRange: "10 tỷ",
    hidden_sections: [], descriptions: { "tong-quan": "Cũ." },
    ...overrides,
  };
}

// Fake deps: giả getFile/putFiles đọc/ghi trực tiếp vào `store` (Map path -> content),
// không gọi GitHub API thật. Mirror cách các test khác trong repo fake deps (deps injection).
function fakeDeps(store) {
  let commitSeq = 0;
  const deps = {
    repo: "x/y",
    pat: "fake",
    branch: "main",
    _putFilesCalls: 0,
    async getFile(repo, branch, filePath) {
      if (!store.has(filePath)) throw new Error(`not found: ${filePath}`);
      return { content: store.get(filePath), sha: "fake-sha" };
    },
    async putFiles(repo, branch, files) {
      deps._putFilesCalls += 1;
      for (const f of files) {
        if (f.remove) store.delete(f.path);
        else store.set(f.path, f.content);
      }
      commitSeq += 1;
      return { commitSha: `commit-${commitSeq}` };
    },
  };
  return deps;
}

test("loadProject trả về object JSON đầy đủ", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const project = await loadProject(deps, "demo-project");
  assert.equal(project.title, "Demo");
});

test("saveProject gộp fields + descriptions + hiddenSections + ảnh field thành 1 lần gọi putFiles", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const result = await saveProject(deps, "demo-project", {
    fields: { title: "Demo Mới" },
    descriptions: { "tong-quan": "Nội dung mới." },
    hiddenSections: ["gia-ban"],
    images: [{ kind: "field", field: "hero_image", filename: "hero-1.jpg", base64: "QUJD", list: false }],
  });
  assert.equal(deps._putFilesCalls, 1); // đúng 1 commit
  assert.ok(result.commitSha);
  assert.ok(result.undoKey);
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.equal(saved.title, "Demo Mới");
  assert.equal(saved.descriptions["tong-quan"], "Nội dung mới.");
  assert.deepEqual(saved.hidden_sections, ["gia-ban"]);
  assert.equal(saved.hero_image, "/images/projects/demo-project/hero-1.jpg");
  assert.ok(store.has("public/images/projects/demo-project/hero-1.jpg"));
});

test("saveProject: images list=true nối vào mảng, không ghi đè", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject({ amenities_images: ["/images/projects/demo-project/old.jpg"] }))]]);
  const deps = fakeDeps(store);
  await saveProject(deps, "demo-project", {
    images: [{ kind: "field", field: "amenities_images", filename: "new.jpg", base64: "QUJD", list: true }],
  });
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.deepEqual(saved.amenities_images, [
    "/images/projects/demo-project/old.jpg",
    "/images/projects/demo-project/new.jpg",
  ]);
});

test("saveProject: descriptions với giá trị rỗng thì xoá key đó", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject({ descriptions: { "gia-ban": "Cũ" } }))]]);
  const deps = fakeDeps(store);
  await saveProject(deps, "demo-project", { descriptions: { "gia-ban": "" } });
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.equal("gia-ban" in saved.descriptions, false);
});

test("saveProject rồi undoLastSave → khôi phục đúng nội dung trước đó", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const { undoKey } = await saveProject(deps, "demo-project", { fields: { title: "Đổi rồi" } });
  assert.equal(JSON.parse(store.get("data/projects/demo-project.json")).title, "Đổi rồi");
  await undoLastSave(deps, undoKey);
  assert.equal(JSON.parse(store.get("data/projects/demo-project.json")).title, "Demo");
});

test("undoLastSave với key sai/hết hạn → throw", async () => {
  const deps = fakeDeps(new Map());
  await assert.rejects(() => undoLastSave(deps, "key-khong-ton-tai"));
});

test("saveProject không cho sửa field slug", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  await assert.rejects(() => saveProject(deps, "demo-project", { fields: { slug: "hack" } }));
});
