(() => {
  const form = document.getElementById("adminForm");
  const statusEl = document.getElementById("formStatus");
  const resultBox = document.getElementById("resultBox");
  const ROOT = window.__ROOT_URL__ || "";

  const safeText = (x) =>
    typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })();

  async function handleSubmit(e) {
    e.preventDefault();
    statusEl.textContent = "";
    resultBox.classList.add("hidden");
    resultBox.classList.remove("border-red-200", "bg-red-50");

    const fd = new FormData(form);
    const payload = {
      username: fd.get("username")?.trim(),
      password: fd.get("password")?.trim(),
    };

    if (!payload.username || !payload.password) {
      statusEl.textContent = "โปรดกรอก Username และ Password ให้ครบถ้วน";
      statusEl.className = "text-sm text-red-600";
      return;
    }

    try {
      statusEl.textContent = "Saving…";
      statusEl.className = "text-sm text-gray-500";

      const res = await fetch(`${ROOT}/recruit/CreateAdmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(safeText(msg));
      }

      statusEl.textContent = "สร้างแอดมินสำเร็จ";
      statusEl.className = "text-sm text-green-600";
      resultBox.innerHTML = `
        <div><strong>Created Admin:</strong> ${data?.username || ""}</div>
        <pre class="mt-2 overflow-auto text-xs bg-gray-50 p-3 rounded-lg border">${JSON.stringify({ ...data, password: "***" }, null, 2)}</pre>
      `;
      resultBox.classList.remove("hidden");
      form.reset();
    } catch (err) {
      statusEl.textContent = err.message || "สร้างแอดมินไม่สำเร็จ";
      statusEl.className = "text-sm text-red-600";
      resultBox.innerHTML = `<div class="text-red-700"><strong>Error:</strong> ${safeText(err.message || err)}</div>`;
      resultBox.classList.remove("hidden");
      resultBox.classList.add("border-red-200", "bg-red-50");
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();