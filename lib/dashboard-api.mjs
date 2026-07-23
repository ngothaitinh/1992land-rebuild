async function request(baseUrl, path, { method = "GET", body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (path.startsWith("/projects/") && method === "GET" && res.status === 401) {
      throw new Error("unauthorized");
    }
    if (path.startsWith("/projects/") && method === "GET" && res.status === 404) {
      throw new Error("not_found");
    }
    if (path === "/undo" && res.status === 410) {
      throw new Error("expired");
    }
    throw new Error(data.error || `Lỗi API (${res.status})`);
  }
  return data;
}

export async function dashboardLogin(baseUrl, password) {
  await request(baseUrl, "/login", { method: "POST", body: { password } });
}

export async function dashboardLogout(baseUrl) {
  await request(baseUrl, "/logout", { method: "POST", body: {} });
}

export async function getDashboardProject(baseUrl, slug) {
  return request(baseUrl, `/projects/${slug}`);
}

export async function saveDashboardProject(baseUrl, slug, patch) {
  return request(baseUrl, `/projects/${slug}/save`, { method: "POST", body: patch });
}

export async function undoDashboardSave(baseUrl, undoKey) {
  return request(baseUrl, "/undo", { method: "POST", body: { undoKey } });
}
