async function request(baseUrl, path, { method = "GET", body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if ((path.startsWith("/projects/") || path.startsWith("/posts/") || path === "/me") && method === "GET" && res.status === 401) {
      throw new Error("unauthorized");
    }
    if ((path.startsWith("/projects/") || path.startsWith("/posts/")) && method === "GET" && res.status === 404) {
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

// Trạng thái phiên đăng nhập, phân biệt rõ 3 trường hợp:
// - "ok": /me trả 200, đã đăng nhập.
// - "unauthorized": /me trả 401 xác nhận, thực sự chưa đăng nhập -> nên chuyển tới trang login.
// - "error": mọi lỗi khác (mất mạng, backend chưa deploy xong, 5xx...) -> KHÔNG nên
//   tự động chuyển tới trang login vì đăng nhập lại cũng sẽ không sửa được lỗi này,
//   dễ gây vòng lặp lặp lại vô hạn (xem finding I5).
export async function checkDashboardSession(baseUrl) {
  try {
    await request(baseUrl, "/me");
    return "ok";
  } catch (e) {
    if (e instanceof Error && e.message === "unauthorized") return "unauthorized";
    return "error";
  }
}

export async function getDashboardPost(baseUrl, slug) {
  return request(baseUrl, `/posts/${slug}`);
}

export async function saveDashboardPost(baseUrl, slug, patch) {
  return request(baseUrl, `/posts/${slug}/save`, { method: "POST", body: patch });
}
