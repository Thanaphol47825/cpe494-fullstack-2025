(() => {
  const form = document.getElementById("applicationRoundForm");
  const statusEl = document.getElementById("formStatus");
  const resultBox = document.getElementById("resultBox");
  const ROOT = window.__ROOT_URL__ || "";

  const safeText = (x) =>
    typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })();

  async function handleSubmit(e) {
    e.preventDefault();
    statusEl.textContent = "";
    resultBox.classList.add("hidden");

    const fd = new FormData(form);
    const payload = {
      round_name: fd.get("round_name")?.trim(),
    };

    if (!payload.round_name) {
      statusEl.textContent = "Please fill round name.";
      statusEl.className = "text-sm text-red-600";
      return;
    }

    try {
      statusEl.textContent = "Saving…";
      statusEl.className = "text-sm text-gray-500";

      const res = await fetch(`${ROOT}/recruit/CreateApplicationRound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.isSuccess) {
        const msg = data?.result || `Request failed (${res.status})`;
        throw new Error(safeText(msg));
      }

      statusEl.textContent = "Saved successfully.";
      statusEl.className = "text-sm text-green-600";
      resultBox.innerHTML = `
        <div><strong>Created Round:</strong> ${data?.result?.round_name || ""}</div>
        <pre class="mt-2 overflow-auto text-xs bg-gray-50 p-3 rounded-lg border">${JSON.stringify(data, null, 2)}</pre>
      `;
      resultBox.classList.remove("hidden");
    } catch (err) {
      statusEl.textContent = err.message || "Save failed.";
      statusEl.className = "text-sm text-red-600";
      resultBox.innerHTML = `<div class="text-red-700"><strong>Error:</strong> ${safeText(err.message || err)}</div>`;
      resultBox.classList.remove("hidden");
      resultBox.classList.add("border-red-200", "bg-red-50");
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();
