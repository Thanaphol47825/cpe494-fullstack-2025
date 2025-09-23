class AdminCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("AdminCreate: render()");
    this.application.mainContainer.innerHTML = "<h2>Create Admin</h2>";

    if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    const formTpl = `
      <form id="adminForm" class="space-y-4">
        <p>
          <label class="block text-sm font-medium">Username</label>
          <input name="username" type="text"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </p>
        <p>
          <label class="block text-sm font-medium">Password</label>
          <input name="password" type="password"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </p>
        <p>
          <input type="submit" value="Save Admin"
                 class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"/>
        </p>
        <p id="formStatus" class="text-sm text-gray-600"></p>
        <div id="resultBox" class="hidden mt-6 rounded-xl border p-4 text-sm"></div>
      </form>
    `;

    this.application.mainContainer.insertAdjacentHTML("beforeend", formTpl);

    document
      .getElementById("adminForm")
      .addEventListener("submit", (e) => this.submit(e));
  }

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const payload = {
      username: fd.get("username")?.trim(),
      password: fd.get("password")?.trim(),
    };

    const statusEl = document.getElementById("formStatus");
    const resultBox = document.getElementById("resultBox");

    if (!payload.username || !payload.password) {
      statusEl.textContent = "โปรดกรอก Username และ Password ให้ครบถ้วน";
      statusEl.className = "text-sm text-red-600";
      return;
    }

    try {
      statusEl.textContent = "Saving…";
      statusEl.className = "text-sm text-gray-500";

      const res = await fetch(`${RootURL}/recruit/CreateAdmin`, {
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

      form.reset();
    } catch (err) {
      statusEl.textContent = err.message || "สร้างแอดมินไม่สำเร็จ";
      statusEl.className = "text-sm text-red-600";

      resultBox.innerHTML = `<div class="text-red-700"><strong>Error:</strong> ${safeText(
        err.message || err
      )}</div>`;
      resultBox.classList.remove("hidden");
      resultBox.classList.add("border-red-200", "bg-red-50");
    }
  }
}
