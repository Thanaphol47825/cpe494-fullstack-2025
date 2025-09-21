// (() => {
//     const ROOT = window.__ROOT_URL__ || "";
//     const form = document.getElementById("coursePlanForm");

//     const getCourses = async () => {
//       try {
//         const res = await fetch(`${ROOT}/curriculum/course/getCourses`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const data = await res.json().catch(() => ([]));
//         if (!res.ok) {
//           const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
//           throw new Error(msg);
//         }

//         // Create select element
//         const select = document.createElement("select");
//         select.name = "CourseId";
//         select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

//         // Add default not-selected option
//         const defaultOption = document.createElement("option");
//         defaultOption.value = "";
//         defaultOption.textContent = "-- Select a course --";
//         defaultOption.disabled = true;
//         defaultOption.selected = true;
//         select.appendChild(defaultOption);

//         data.result.forEach(item => {
//           const option = document.createElement("option");
//           option.value = item.ID;
//           option.textContent = item.name;
//           select.appendChild(option);
//         });

//         return select;
//       } catch (err) {
//         console.error("Failed to fetch courses:", err);
//         return document.createTextNode("Failed to load courses");
//       }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData(form);
//         const payload = Object.fromEntries(formData.entries());

//         if (!payload.CourseId) {
//             alert("Please select a course.");
//             return;
//         }
//         payload.CourseId = parseInt(payload.CourseId);

//         try {
//             const res = await fetch(form.action, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });
//             const data = await res.json();
//             if (data.isSuccess) {
//                 alert("Course Plan saved!");
//                 form.reset();
//             } else {
//                 alert("Error: " + (data.result || "Failed to save"));
//             }
//         } catch (err) {
//             alert("Network error: " + err.message);
//         }
//     };

//     document.addEventListener("DOMContentLoaded", async () => {
//       const container = document.getElementById("CourseSelectContainer");
//       if (container) {
//         const select = await getCourses();
//         container.appendChild(select);
//       }

//       if (form) {
//         form.addEventListener("submit", handleSubmit);
//       }
//     });
// })();
// import { DOMObject } from 'ModEd/core/static/js/DOMObject.js'; // ปรับ path ตามจริง

// async function renderCoursePlanForm(mainContainer) {
//     // ดึง template จากไฟล์ .tpl
//     const response = await fetch('/curriculum/view/CoursePlan.tpl');
//     const templateString = await response.text();

//     // สร้าง DOMObject (data สามารถเป็น {} หรือข้อมูลที่ต้องการ bind)
//     const domObj = new DOMObject(templateString, {}, false);

//     // แสดงผลใน mainContainer
//     mainContainer.innerHTML = '';
//     mainContainer.appendChild(domObj.html);
// }

class CoursePlanCreate {
    constructor(application) {
        console.log(application);
        this.application = application;
    }

    async render() {
        console.log("Create Course Plan Form");
        console.log(this.application);
            // Ensure Tailwind CSS is loaded
            if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
                document.head.appendChild(script);
            }
            // สร้าง template string ที่เหมือน coursePlan.tpl
            const templateString = `
            <div class="max-w-3xl mx-auto py-10 px-4">
                <header class="mb-8">
                    <h1 class="text-3xl font-bold tracking-tight">Add Course Plan</h1>
                </header>
                <section class="bg-white rounded-2xl shadow p-6">
                    <form id="coursePlanForm" method="post" action="${window.__ROOT_URL__}/curriculum/CoursePlan/createCoursePlan" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Course<span class="text-red-500">*</span></label>
                            <div id="CourseSelectContainer"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Date<span class="text-red-500">*</span></label>
                            <input type="date" name="date" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Week<span class="text-red-500">*</span></label>
                            <input type="number" name="week" min="1" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter a number of week" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Topic<span class="text-red-500">*</span></label>
                            <textarea name="topic" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Course Plan Topic"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Course Plan Description"></textarea>
                        </div>
                        <div class="md:col-span-2">
                            <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save Course Plan</button>
                        </div>
                    </form>
                </section>
            </div>
            `;
            // สร้าง DOMObject จาก template string
            const domObj = new DOMObject(templateString, {}, false);
            this.application.mainContainer.innerHTML = '';
            this.application.mainContainer.appendChild(domObj.html);
            // ดึงข้อมูล course แล้วสร้าง select dropdown
        const container = domObj.html.querySelector('#CourseSelectContainer');
        if (container) {
            try {
                const ROOT = window.__ROOT_URL__ || "";
                const res = await fetch(`${ROOT}/curriculum/course/getCourses`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                if (!res.ok) {
                    const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
                    throw new Error(msg);
                }
                const select = document.createElement("select");
                select.name = "CourseId";
                select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a course --";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                select.appendChild(defaultOption);
                (data.result || []).forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.ID;
                    option.textContent = item.name;
                    select.appendChild(option);
                });
                container.innerHTML = "";
                container.appendChild(select);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                container.textContent = "Failed to load courses";
            }
        }
    }
}