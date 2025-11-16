if (typeof window !== "undefined" && !window.InternshipPersonalAttendance) {
  class InternshipPersonalAttendance {
    constructor(application) {
      this.application = application;
      this.studentData = null;
      this.internStudentData = null;
      this.internshipInfoData = null;
      this.todayAttendance = null;
      this.isVerified = false;
      this.allAttendanceRecords = [];
      this.showingAllRecords = false;
      this.template = null;
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = () => {
            if (window.InternshipPageTemplate) {
              resolve();
            } else {
              reject(new Error("InternshipPageTemplate failed to load"));
            }
          };
          script.onerror = () =>
            reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    async loadTemplate() {
      try {
        const response = await fetch(
          "/curriculum/static/view/InternshipPersonalAttendanceTemplate.tpl"
        );
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.status}`);
        }
        this.template = await response.text();
      } catch (error) {
        console.error("Error loading template:", error);
        throw error;
      }
    }

    preparePageConfig() {
      return {
        title: "Personal Attendance Check-In/Out",
        description: "Record your daily attendance",
        showBackButton: false,
        pageClass: "personal-attendance-page",
        headerClass: "attendance-header",
        contentClass: "attendance-content",
      };
    }

    createVerificationForm() {
      const container = document.createElement("div");
      container.innerHTML = this.template;
      return container.querySelector("#verification-form-container").innerHTML;
    }

    createAttendancePanel() {
      const studentName = `${this.studentData.first_name || ""} ${
        this.studentData.last_name || ""
      }`.trim();
      const studentCode = this.studentData.student_code || "N/A";

      const hasCheckedIn =
        this.todayAttendance &&
        (this.todayAttendance.check_in_time ||
          this.todayAttendance.CheckInTime) &&
        (this.todayAttendance.check_in_time ||
          this.todayAttendance.CheckInTime) !== "0001-01-01T00:00:00Z" &&
        (this.todayAttendance.check_in_time ||
          this.todayAttendance.CheckInTime) !== null;

      const hasCheckedOut =
        this.todayAttendance &&
        (this.todayAttendance.check_out_time ||
          this.todayAttendance.CheckOutTime) &&
        (this.todayAttendance.check_out_time ||
          this.todayAttendance.CheckOutTime) !== "0001-01-01T00:00:00Z" &&
        (this.todayAttendance.check_out_time ||
          this.todayAttendance.CheckOutTime) !== null;

      const checkInTime = hasCheckedIn
        ? new Date(
            this.todayAttendance.check_in_time ||
              this.todayAttendance.CheckInTime
          ).toLocaleTimeString()
        : "Not checked in";

      const checkOutTime = hasCheckedOut
        ? new Date(
            this.todayAttendance.check_out_time ||
              this.todayAttendance.CheckOutTime
          ).toLocaleTimeString()
        : "Not checked out";

      // Return template content that will be populated with data
      const container = document.createElement("div");
      container.innerHTML = this.template;

      // Show attendance panel, hide verification form
      container.querySelector("#verification-form-container").style.display =
        "none";
      container
        .querySelector("#attendance-panel-container")
        .classList.remove("hidden");

      // Update student info
      container.querySelector("#student-avatar").textContent = studentName
        .charAt(0)
        .toUpperCase();
      container.querySelector("#student-name").textContent = studentName;
      container.querySelector(
        "#student-code"
      ).textContent = `Student Code: ${studentCode}`;
      container.querySelector("#current-date").textContent =
        new Date().toLocaleDateString();

      // Update check-in section
      const checkinSection = container.querySelector("#checkin-section");
      const checkoutSection = container.querySelector("#checkout-section");

      if (hasCheckedIn) {
        checkinSection.className =
          "flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200";
        const checkinSvg = checkinSection.querySelector("svg");
        if (checkinSvg) {
          checkinSvg.setAttribute("class", "w-6 h-6 text-green-600");
        }
        const checkinP = checkinSection.querySelector("p");
        if (checkinP) {
          checkinP.className = "font-medium text-green-800";
        }
        container.querySelector("#checkin-time").className =
          "text-sm text-green-600";
        container.querySelector("#checkin-time").textContent = checkInTime;
        container.querySelector(
          "#checkin-btn"
        ).outerHTML = `<span class="text-green-600 font-medium">✓ Completed</span>`;
      } else {
        container.querySelector("#checkin-time").textContent = checkInTime;
      }

      // Update check-out section
      if (hasCheckedOut) {
        checkoutSection.className =
          "flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200";
        const checkoutSvg = checkoutSection.querySelector("svg");
        if (checkoutSvg) {
          checkoutSvg.setAttribute("class", "w-6 h-6 text-blue-600");
        }
        const checkoutP = checkoutSection.querySelector("p");
        if (checkoutP) {
          checkoutP.className = "font-medium text-blue-800";
        }
        container.querySelector("#checkout-time").className =
          "text-sm text-blue-600";
        container.querySelector("#checkout-time").textContent = checkOutTime;
        container.querySelector(
          "#checkout-btn-container"
        ).outerHTML = `<span class="text-blue-600 font-medium">✓ Completed</span>`;
      } else if (hasCheckedIn) {
        container.querySelector("#checkout-time").textContent = checkOutTime;
        container.querySelector(
          "#checkout-btn-container"
        ).outerHTML = `<button id="checkout-btn" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium">Check Out</button>`;
      } else {
        container.querySelector("#checkout-time").textContent =
          "Not checked out";
      }

      return container.innerHTML;
    }

    setupEventListeners() {
      if (!this.isVerified) {
        const verificationForm = document.getElementById("verification-form");
        if (verificationForm) {
          verificationForm.addEventListener(
            "submit",
            this.handleVerification.bind(this)
          );
        }
      } else {
        const checkinBtn = document.getElementById("checkin-btn");
        if (checkinBtn) {
          checkinBtn.addEventListener("click", this.handleCheckIn.bind(this));
        }

        const checkoutBtn = document.getElementById("checkout-btn");
        if (checkoutBtn) {
          checkoutBtn.addEventListener("click", this.handleCheckOut.bind(this));
        }

        const changeStudentBtn = document.getElementById("change-student-btn");
        if (changeStudentBtn) {
          changeStudentBtn.addEventListener("click", () => {
            this.isVerified = false;
            this.studentData = null;
            this.internStudentData = null;
            this.internshipInfoData = null;
            this.todayAttendance = null;
            this.render();
          });
        }

        const viewAllBtn = document.getElementById("view-all-records-btn");
        if (viewAllBtn) {
          viewAllBtn.addEventListener("click", () =>
            this.loadAndShowAllRecords()
          );
        }

        const hideRecordsBtn = document.getElementById("hide-records-btn");
        if (hideRecordsBtn) {
          hideRecordsBtn.addEventListener("click", () => this.hideAllRecords());
        }
      }
    }

    async handleVerification(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const studentCode = formData.get("student_code");

      if (!studentCode) {
        this.showError("Please enter your student code");
        return;
      }

      try {
        const studentResponse = await fetch(`/common/students/getall`);
        const studentResult = await studentResponse.json();

        if (!studentResponse.ok || !studentResult.isSuccess) {
          throw new Error("Failed to load students");
        }

        this.studentData = studentResult.result.find(
          (student) => student.student_code === studentCode
        );

        if (!this.studentData) {
          throw new Error("Student not found");
        }

        const studentId = this.studentData.ID;

        const internResponse = await fetch(`/curriculum/InternStudent`);
        const internResult = await internResponse.json();

        if (!internResponse.ok || !internResult.isSuccess) {
          throw new Error("Failed to load intern data");
        }

        const internStudents = internResult.result;
        this.internStudentData = internStudents.find(
          (intern) =>
            intern.StudentID === studentId || intern.student_id === studentId
        );

        if (!this.internStudentData) {
          throw new Error("You are not registered as an intern student");
        }

        const infoResponse = await fetch(
          `/curriculum/InternshipInformation/getByStudentID/${studentId}`
        );
        const infoResult = await infoResponse.json();

        if (
          infoResponse.ok &&
          infoResult.isSuccess &&
          infoResult.result.length > 0
        ) {
          this.internshipInfoData = infoResult.result[0];
          await this.checkTodayAttendance();
        } else {
          throw new Error("Internship information not found for this student");
        }

        this.isVerified = true;
        await this.render();
      } catch (error) {
        console.error("Verification error:", error);
        this.showError(error.message || "Verification failed");
      }
    }

    async checkTodayAttendance() {
      if (!this.studentData) return;

      try {
        const studentId = this.studentData.ID;
        const response = await fetch(
          `/curriculum/InternshipAttendance/getTodayByStudentID/${studentId}`
        );
        const result = await response.json();

        if (response.ok && result.isSuccess) {
          this.todayAttendance = result.result;
        } else {
          this.todayAttendance = null;
        }
      } catch (error) {
        console.error("Error checking today's attendance:", error);
        this.todayAttendance = null;
      }
    }

    async handleCheckIn() {
      if (!this.internshipInfoData) {
        this.showError("Internship information not found");
        return;
      }

      const checkinBtn = document.getElementById("checkin-btn");
      if (checkinBtn) {
        checkinBtn.disabled = true;
        checkinBtn.textContent = "Checking in...";
      }

      try {
        await this.checkTodayAttendance();

        if (
          this.todayAttendance &&
          (this.todayAttendance.check_in_time ||
            this.todayAttendance.CheckInTime) &&
          (this.todayAttendance.check_in_time ||
            this.todayAttendance.CheckInTime) !== "0001-01-01T00:00:00Z" &&
          (this.todayAttendance.check_in_time ||
            this.todayAttendance.CheckInTime) !== null
        ) {
          throw new Error("You have already checked in today");
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().split(" ")[0];

        const payload = {
          date: `${today}T00:00:00Z`,
          check_in_time: `${today}T${currentTime}Z`,
          check_in_status: true,
          assing_work: "",
          student_info_id: this.internshipInfoData.ID,
        };

        const response = await fetch(
          "/curriculum/InternshipAttendance/CreateInternshipAttendance",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to check in");
        }

        this.todayAttendance = {
          ID: result.result?.ID,
          date: payload.date,
          CheckInTime: `${today}T${currentTime}Z`,
          CheckOutTime: null,
          check_in_status: true,
          assing_work: "",
          StudentInfoID: this.internshipInfoData.ID,
          student_info_id: this.internshipInfoData.ID,
        };

        this.showSuccess("Checked in successfully!");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.render();
      } catch (error) {
        console.error("Check-in error:", error);
        this.showError(error.message || "Check-in failed");

        if (checkinBtn) {
          checkinBtn.disabled = false;
          checkinBtn.textContent = "Check In";
        }
      }
    }

    async handleCheckOut() {
      if (!this.internshipInfoData) {
        this.showError("Internship information not found");
        return;
      }

      const checkoutBtn = document.getElementById("checkout-btn");
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Checking out...";
      }

      try {
        await this.checkTodayAttendance();

        if (!this.todayAttendance) {
          throw new Error("Please check in first");
        }

        if (
          (this.todayAttendance.check_out_time ||
            this.todayAttendance.CheckOutTime) &&
          (this.todayAttendance.check_out_time ||
            this.todayAttendance.CheckOutTime) !== "0001-01-01T00:00:00Z" &&
          (this.todayAttendance.check_out_time ||
            this.todayAttendance.CheckOutTime) !== null
        ) {
          throw new Error("You have already checked out today");
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().split(" ")[0];

        const payload = {
          ID: this.todayAttendance.ID,
          date: this.todayAttendance.date,
          check_in_time: this.todayAttendance.CheckInTime,
          check_out_time: `${today}T${currentTime}Z`,
          check_in_status: this.todayAttendance.check_in_status,
          assing_work: this.todayAttendance.assing_work || "",
          student_info_id:
            this.todayAttendance.StudentInfoID ||
            this.todayAttendance.student_info_id,
        };

        const response = await fetch(
          `/curriculum/InternshipAttendance/UpdateInternshipAttendance`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to check out");
        }

        this.todayAttendance = {
          ...this.todayAttendance,
          CheckOutTime: `${today}T${currentTime}Z`,
          check_out_time: `${today}T${currentTime}Z`,
        };

        this.showSuccess("Checked out successfully!");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.render();
      } catch (error) {
        console.error("Check-out error:", error);
        this.showError(error.message || "Check-out failed");

        if (checkoutBtn) {
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = "Check Out";
        }
      }
    }

    async render() {
      try {
        await this.loadInternshipPageTemplate();
        await this.loadTemplate();

        if (this.isVerified && this.internshipInfoData) {
          await this.checkTodayAttendance();
        }

        this.application.mainContainer.innerHTML = "";

        const pageConfig = this.preparePageConfig();
        let formContent;

        if (!this.isVerified) {
          formContent = this.createVerificationForm();
        } else {
          formContent = this.createAttendancePanel();
        }

        const pageElement = await window.InternshipPageTemplate.render(
          pageConfig,
          formContent,
          this.application
        );

        this.application.mainContainer.appendChild(pageElement);
        this.setupEventListeners();
      } catch (error) {
        console.error("Error rendering InternshipPersonalAttendance:", error);
        this.showError("Failed to load page: " + error.message);
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(
          message,
          this.application.mainContainer
        );
      } else {
        alert("Error: " + message);
      }
    }

    showSuccess(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showSuccess(
          message,
          this.application.mainContainer
        );
      } else {
        alert(message);
      }
    }

    async loadAndShowAllRecords() {
      const container = document.getElementById("all-records-container");
      const loading = document.getElementById("records-loading");
      const error = document.getElementById("records-error");
      const tableContainer = document.getElementById("records-table-container");
      const tbody = document.getElementById("records-tbody");
      const empty = document.getElementById("records-empty");

      if (!container) return;

      container.classList.remove("hidden");
      loading.classList.remove("hidden");
      error.classList.add("hidden");
      tableContainer.classList.add("hidden");
      empty.classList.add("hidden");

      try {
        const response = await fetch("/curriculum/InternshipAttendance/getall");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.isSuccess) {
          throw new Error(data.error || "Failed to fetch records");
        }

        const studentInfoId = this.internshipInfoData.ID;
        this.allAttendanceRecords = (data.result || []).filter(
          (record) =>
            record.student_info_id === studentInfoId ||
            record.StudentInfoID === studentInfoId
        );

        loading.classList.add("hidden");

        if (this.allAttendanceRecords.length === 0) {
          empty.classList.remove("hidden");
        } else {
          tbody.innerHTML = "";
          this.allAttendanceRecords.forEach((record) => {
            const row = this.createRecordRow(record);
            tbody.appendChild(row);
          });
          tableContainer.classList.remove("hidden");
        }
      } catch (err) {
        console.error("Error loading records:", err);
        loading.classList.add("hidden");
        error.classList.remove("hidden");
        document.getElementById("records-error-message").textContent =
          "Failed to load attendance records: " + err.message;
      }
    }

    createRecordRow(record) {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50";

      const dateCell = tr.insertCell();
      dateCell.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
      dateCell.textContent = new Date(record.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const checkInCell = tr.insertCell();
      checkInCell.className =
        "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
      checkInCell.textContent = record.check_in_time
        ? new Date(record.check_in_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A";

      const checkOutCell = tr.insertCell();
      checkOutCell.className =
        "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
      checkOutCell.textContent = record.check_out_time
        ? new Date(record.check_out_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A";

      const statusCell = tr.insertCell();
      statusCell.className = "px-6 py-4 whitespace-nowrap text-sm";
      const isOnTime =
        record.check_in_status === true || record.check_in_status === "true";
      const badgeClass = isOnTime
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
      const statusText = isOnTime ? "On Time" : "Late";
      statusCell.innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">${statusText}</span>`;

      return tr;
    }

    hideAllRecords() {
      const container = document.getElementById("all-records-container");
      if (container) {
        container.classList.add("hidden");
      }
    }
  }

  if (typeof window !== "undefined") {
    window.InternshipPersonalAttendance = InternshipPersonalAttendance;
  }
}
