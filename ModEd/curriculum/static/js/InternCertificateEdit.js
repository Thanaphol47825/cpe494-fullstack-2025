// curriculum/static/js/CertificateEdit.js
if (typeof window !== "undefined" && !window.CertificateEdit) {
    class CertificateEdit {
      constructor(app, id) {
        this.app = app;
        this.rootURL = window.__ROOT_URL__ || "";
        this.id = id;
        this.role = (localStorage.getItem("role") || "Student");
        this.userId = parseInt(localStorage.getItem("userId")) || null;
        this.permissions = {
          Student: { update: false, read: true },
          Instructor: { update: true, read: true },
          Admin: { update: true, read: true }
        };
        this.data = null;
      }
  
      can(action) {
        return this.permissions[this.role]?.[action] === true;
      }
  
      headers() {
        return {
          "Content-Type": "application/json",
          "X-User-Role": this.role,
          "X-User-Id": this.userId ? String(this.userId) : ""
        };
      }
  
      async load() {
        try {
          const res = await fetch(`${this.rootURL}/curriculum/Certificate/${this.id}`, {
            method: "GET",
            headers: this.headers()
          });
          const j = await res.json();
          if (!j.success) throw new Error(j.message || "Failed to fetch");
          this.data = j.data;
          this.render();
        } catch (err) {
          console.error("CertificateEdit.load:", err);
          this.app.mainContainer.innerHTML = `<div class="p-6 text-red-600">Failed to load certificate: ${err.message}</div>`;
        }
      }
  
      render() {
        const c = this.app.mainContainer;
        c.innerHTML = "";
  
        const title = document.createElement("h1");
        title.className = "text-2xl font-bold mb-4";
        title.textContent = this.can("update") ? "Edit Certificate" : "Certificate Details";
        c.appendChild(title);
  
        if (!this.can("update")) {
          // read-only view
          const block = document.createElement("div");
          block.className = "bg-white p-4 rounded shadow";
          const name = this.data.certificate_name || "";
          const company = this.data.company_id || "";
          block.innerHTML = `
            <p><strong>Name:</strong> ${this.escape(name)}</p>
            <p><strong>Company ID:</strong> ${this.escape(company)}</p>
            <div class="mt-4"><button id="back-btn" class="px-4 py-2 bg-gray-200 rounded">Back</button></div>
          `;
          c.appendChild(block);
          document.getElementById("back-btn").onclick = () => window.location.hash = "#/certificate";
          return;
        }
  
        // editable form
        c.insertAdjacentHTML("beforeend", `
          <form id="cert-edit-form" class="bg-white p-4 rounded shadow space-y-4">
            <div>
              <label class="block text-sm font-medium">Certificate Name</label>
              <input name="certificate_name" type="text" required class="mt-1 block w-full border rounded p-2" value="${this.escape(this.data.certificate_name || "")}" />
            </div>
            <div>
              <label class="block text-sm font-medium">Company ID</label>
              <input name="company_id" type="number" required class="mt-1 block w-full border rounded p-2" value="${this.escape(this.data.company_id || "")}" />
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button type="submit" id="update-btn" class="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
            </div>
          </form>
        `);
  
        document.getElementById("cancel-btn").onclick = () => window.location.hash = "#/certificate";
        document.getElementById("cert-edit-form").addEventListener("submit", (e) => this.submit(e));
      }
  
      escape(s) {
        return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
  
      async submit(e) {
        e.preventDefault();
        const form = e.target;
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.company_id = parseInt(payload.company_id, 10);
  
        const updateBtn = document.getElementById("update-btn");
        updateBtn.disabled = true;
        updateBtn.textContent = "Updating...";
  
        try {
          const res = await fetch(`${this.rootURL}/curriculum/UpdateCertificate/${this.id}`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(payload)
          });
          const j = await res.json();
          if (!j.success) throw new Error(j.message || "Update failed");
          alert("Updated");
          window.location.hash = "#/certificate";
        } catch (err) {
          console.error("Update error:", err);
          alert("Update failed: " + err.message);
        } finally {
          updateBtn.disabled = false;
          updateBtn.textContent = "Update";
        }
      }
    }
  
    window.CertificateEdit = CertificateEdit;
  }
  