
class InternshipReportCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("Create Internship Report Form");
    console.log(this.application);

    if (
      !document.querySelector('script[src*="@tailwindcss/browser"]') &&
      !document.querySelector('link[href*="tailwind"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
      document.head.appendChild(script);
    }

    const ROOT = window.__ROOT_URL__ || "";
    const title =
      (this.application && this.application.title) || "Internship Report";
    const urlParams = new URLSearchParams(location.search);
    const isSuccess = ["1", "true", "yes"].includes(
      (urlParams.get("success") || "").toLowerCase()
    );

    const templateString = `
      <div class="min-h-[70vh] bg-[radial-gradient(1200px_600px_at_10%_-10%,#eef2ff_0%,transparent_50%),radial-gradient(1000px_500px_at_110%_10%,#e0e7ff_0%,transparent_45%),#f5f7fb] py-10 px-4">
        <div class="max-w-2xl mx-auto bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <header class="flex items-center gap-3 px-6 py-5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
            <div class="grid place-items-center w-10 h-10 rounded-xl text-white font-bold tracking-wide shadow-lg
                        bg-gradient-to-br from-indigo-600 to-indigo-700">IR</div>
            <div>
              <h1 class="text-xl md:text-2xl font-bold text-slate-900">${title}</h1>
              <p class="text-sm text-slate-500">บันทึกคะแนนรายงานฝึกงาน (0–100)</p>
            </div>
          </header>

          <!-- Content -->
          <section class="p-6 space-y-4">
            ${
              isSuccess
                ? `
              <div class="flex items-start gap-2 rounded-xl border border-green-200 bg-emerald-50 text-emerald-800 p-3 animate-[slideFade_.6s_ease-out]">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" class="mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"></path>
                  <path d="M22 4 12 14.01l-3-3" stroke="currentColor" stroke-width="2"></path>
                </svg>
                <div><strong>บันทึกสำเร็จ!</strong> รายการถูกบันทึกลงฐานข้อมูลแล้ว</div>
              </div>`
                : ""
            }

            <form id="internshipReportForm" method="POST" action="${ROOT}/curriculum/CreateInternshipReport" novalidate class="space-y-4">
              <!-- Report Score -->
              <div class="grid gap-2">
                <label for="ReportScore" class="text-sm font-semibold text-slate-800">Report Score</label>
                <input
                  type="number"
                  id="ReportScore"
                  name="ReportScore"
                  min="0"
                  max="100"
                  step="1"
                  inputmode="numeric"
                  placeholder="เช่น 85"
                  required
                  class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-slate-900 outline-none
                         focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                  aria-describedby="scoreHint"
                />
                <p id="scoreHint" class="text-xs text-slate-500 -mt-1">กรอกเฉพาะตัวเลขระหว่าง 0 ถึง 100</p>
                <p id="scoreError" class="hidden text-sm text-rose-700 mt-1">กรุณากรอกคะแนนระหว่าง 0–100</p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 pt-2">
                <button type="reset"
                        class="btn-secondary inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-slate-800
                               hover:bg-gray-50 active:translate-y-px transition">
                  ล้างค่า
                </button>
                <button type="submit" id="submitBtn"
                        class="btn-primary inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-600/30
                               hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 active:translate-y-px transition">
                  บันทึก
                </button>
              </div>
            </form>
          </section>

          <!-- Footer -->
          <footer class="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm text-slate-500 bg-white">
            <span>Internship Report • ModEd</span>
            <a href="${ROOT}/curriculum/InternshipReport" target="_blank" rel="noopener"
               class="font-semibold text-indigo-600 hover:underline">ดูรายการ (JSON)</a>
          </footer>
        </div>
      </div>
    `;

    const domObj = new DOMObject(templateString, {}, false);
    this.application.mainContainer.innerHTML = "";
    this.application.mainContainer.appendChild(domObj.html);

    const form = domObj.html.querySelector("#internshipReportForm");
    const scoreInput = domObj.html.querySelector("#ReportScore");
    const scoreError = domObj.html.querySelector("#scoreError");
    const submitBtn = domObj.html.querySelector("#submitBtn");

    const validate = () => {
      const v = scoreInput.value.trim();
      const n = Number(v);
      const ok = v !== "" && Number.isFinite(n) && n >= 0 && n <= 100;
      scoreError.classList.toggle("hidden", ok);
      scoreInput.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    };

    scoreInput.addEventListener("input", () => {
      const n = Number(scoreInput.value);
      if (Number.isFinite(n)) {
        if (n < 0) scoreInput.value = 0;
        if (n > 100) scoreInput.value = 100;
      }
      validate();
    });

    form.addEventListener("submit", (e) => {
      if (!validate()) {
        e.preventDefault();
        scoreInput.focus();
        return;
      }
      submitBtn.disabled = true;
      submitBtn.classList.add("opacity-80", "cursor-not-allowed");
      submitBtn.textContent = "กำลังบันทึก…";
    });
  }
}
