if (typeof window !== "undefined" && !window.InternshipAttendanceList) {
  class InternshipAttendanceList {
    constructor(application) {
      this.application = application;
      this.currentData = [];
      this.sortColumn = null;
      this.sortDirection = "asc";
      this.templates = {
        main: null,
        stat: null,
      };

      this.columns = this.getColumnDefinitions();
      this.statusFilterOptions = this.getStatusFilterOptions();
    }

    getStatusFilterOptions() {
      return [
        { value: "", label: "All Status" },
        { value: "true", label: "On Time" },
        { value: "false", label: "Late" },
      ];
    }

    getColumnDefinitions() {
      return [
        {
          key: "id",
          label: "ID",
          sortable: true,
          width: "w-20",
          align: "left",
          render: (value, row) => `#${value}`,
        },
        {
          key: "date",
          label: "Date",
          sortable: true,
          width: "w-32",
          align: "left",
          render: (value, row) => {
            const date = new Date(row.date);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          },
        },
        {
          key: "student_info",
          label: "Student",
          sortable: true,
          width: "w-48",
          align: "left",
          render: (value, row) => {
            // Access nested student data: InternshipInformation.InternStudent.Student
            const student = row.InternshipInformation?.InternStudent?.Student;
            const studentName = student
              ? `${student.first_name || ""} ${
                  student.last_name || ""
                }`.trim() || "N/A"
              : "N/A";
            const studentCode = student?.student_code || "N/A";

            return `
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">${studentName
                      .charAt(0)
                      .toUpperCase()}</span>
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">${studentName}</div>
                  <div class="text-xs text-gray-500">${studentCode}</div>
                </div>
              </div>
            `;
          },
        },
        {
          key: "check_in_time",
          label: "Check-In",
          sortable: true,
          width: "w-28",
          align: "left",
          render: (value, row) => {
            if (!row.check_in_time) return "N/A";
            try {
              const time = new Date(row.check_in_time).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              );
              return `<span class="text-sm font-mono">${time}</span>`;
            } catch {
              return "N/A";
            }
          },
        },
        {
          key: "check_out_time",
          label: "Check-Out",
          sortable: true,
          width: "w-28",
          align: "left",
          render: (value, row) => {
            if (!row.check_out_time) return "N/A";
            try {
              const time = new Date(row.check_out_time).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              );
              return `<span class="text-sm font-mono">${time}</span>`;
            } catch {
              return "N/A";
            }
          },
        },
        {
          key: "check_in_status",
          label: "Status",
          sortable: true,
          width: "w-28",
          align: "left",
          render: (value, row) =>
            this.createCheckInStatusBadge(row.check_in_status),
        },
        {
          key: "assing_work",
          label: "Assigned Work",
          sortable: true,
          width: "w-32",
          align: "left",
          render: (value, row) => this.createAssignedWorkBadge(row.assing_work),
        },
        {
          key: "created_at",
          label: "Created At",
          sortable: true,
          width: "w-36",
          align: "left",
          render: (value, row) => {
            try {
              return new Date(row.CreatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            } catch {
              return "N/A";
            }
          },
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          width: "w-40",
          align: "right",
          render: (value, row) => {
            return `
              <div class="flex justify-end space-x-2">
                <button type="button" class="text-blue-600 hover:text-blue-900 transition-colors duration-150" onclick="if(window.internshipAttendanceList) window.internshipAttendanceList.viewAttendance(${row.ID})">
                  View
                </button>
                <button type="button" class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" onclick="if(window.internshipAttendanceList) window.internshipAttendanceList.editAttendance(${row.ID})">
                  Edit
                </button>
                <button type="button" class="text-red-600 hover:text-red-900 transition-colors duration-150" onclick="if(window.internshipAttendanceList) window.internshipAttendanceList.deleteAttendance(${row.ID})">
                  Delete
                </button>
              </div>
            `;
          },
        },
      ];
    }

    /**
     * Set which columns to display
     */
    setVisibleColumns(columnKeys) {
      const allColumns = this.getColumnDefinitions();
      this.columns = allColumns.filter((col) => columnKeys.includes(col.key));
    }

    async loadTemplates() {
      try {
        console.log("Loading InternshipAttendanceList templates...");

        const mainResponse = await fetch(
          "/curriculum/static/view/InternshipTableTemplate.tpl"
        );
        if (!mainResponse.ok) {
          throw new Error(
            `Failed to load main template: ${mainResponse.status}`
          );
        }
        this.templates.main = await mainResponse.text();
        console.log("Main template loaded successfully");

        const statResponse = await fetch(
          "/curriculum/static/view/InternshipStatusTemplate.tpl"
        );
        if (!statResponse.ok) {
          throw new Error(
            `Failed to load stat template: ${statResponse.status}`
          );
        }
        this.templates.stat = await statResponse.text();
        console.log("Stat template loaded successfully");
      } catch (error) {
        console.error("Error loading templates:", error);
        throw error;
      }
    }

    async render() {
      console.log("Rendering Internship Attendance List");

      // Set global instance for onclick handlers
      window.internshipAttendanceList = this;

      try {
        // Clear the container first
        this.application.mainContainer.innerHTML = "";

        // Load templates
        await this.loadTemplates();

        // Prepare page data
        const pageData = {
          page_title: "Internship Attendance",
          page_description: "Track and manage student attendance records",
        };

        // Render main template with Mustache
        const pageHTML = Mustache.render(this.templates.main, pageData);

        // Create element from HTML string
        const pageWrapper = this.application.create(pageHTML);

        // Append to container
        this.application.mainContainer.appendChild(pageWrapper);

        console.log("Page rendered, populating filters and stats...");

        // Populate filters
        this.populateStatusFilter();

        // Render stats section
        this.renderStatsSection();

        // Render table headers
        this.renderTableHeaders();

        // Setup event listeners
        this.setupEventListeners();

        console.log("Loading attendance records...");

        // Load initial data
        await this.loadAttendanceRecords();
      } catch (error) {
        console.error("Error rendering internship attendance list:", error);
        this.showError("Failed to load page: " + error.message);
      }
    }

    /**
     * Populate status filter dropdown
     */
    populateStatusFilter() {
      const statusFilter = document.getElementById("status-filter");
      if (!statusFilter) {
        console.warn("Status filter element not found");
        return;
      }

      statusFilter.innerHTML = "";

      this.statusFilterOptions.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        statusFilter.appendChild(optionElement);
      });

      console.log("Status filter populated");
    }

    /**
     * Populate assigned work filter dropdown
     */
    populateWorkFilter() {
      // Check if there's a secondary filter for assigned work
      const workFilter = document.getElementById("work-filter");
      if (!workFilter) return;

      workFilter.innerHTML = "";

      this.getAssignedWorkFilterOptions().forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        workFilter.appendChild(optionElement);
      });
    }

    renderStatsSection() {
      const statsContainer = document.getElementById("stats-section");
      if (!statsContainer) {
        console.warn("Stats container not found");
        return;
      }

      const stats = [
        {
          stat_label: "Total Records",
          stat_id: "total-count",
          stat_value: "0",
          icon_bg_color: "bg-blue-100",
          icon_text_color: "text-blue-600",
          icon_path:
            "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        },
        {
          stat_label: "On Time",
          stat_id: "on-time-count",
          stat_value: "0",
          icon_bg_color: "bg-green-100",
          icon_text_color: "text-green-600",
          icon_path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          stat_label: "Late",
          stat_id: "late-count",
          stat_value: "0",
          icon_bg_color: "bg-red-100",
          icon_text_color: "text-red-600",
          icon_path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        },
      ];

      statsContainer.innerHTML = "";
      stats.forEach((stat) => {
        const statHTML = Mustache.render(this.templates.stat, stat);
        const statElement = this.application.create(statHTML);
        statsContainer.appendChild(statElement);
      });

      console.log("Stats section rendered");
    }

    renderTableHeaders() {
      const headerRow = document.getElementById("table-header");
      if (!headerRow) {
        console.warn("Table header row not found");
        return;
      }

      headerRow.innerHTML = "";

      this.columns.forEach((column) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.className = `px-6 py-3 text-${
          column.align
        } text-xs font-medium text-gray-500 uppercase tracking-wider ${
          column.width || ""
        }`;

        if (column.sortable) {
          th.classList.add("cursor-pointer", "hover:bg-gray-100");
          th.dataset.sort = column.key;

          const sortIcon = `
            <svg class="inline-block w-4 h-4 ml-1 ${
              this.sortColumn === column.key ? "text-blue-600" : ""
            }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
            </svg>
          `;

          th.innerHTML = `${column.label}${sortIcon}`;
        } else {
          th.textContent = column.label;
        }

        headerRow.appendChild(th);
      });

      console.log("Table headers rendered");
    }

    setupEventListeners() {
      document
        .getElementById("refresh-btn")
        ?.addEventListener("click", () => this.loadAttendanceRecords());

      document
        .getElementById("create-btn")
        ?.addEventListener("click", () => this.navigateToCreate());
      document
        .getElementById("create-empty-btn")
        ?.addEventListener("click", () => this.navigateToCreate());

      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(
            () => this.handleSearch(e.target.value),
            300
          );
        });
      }

      document
        .getElementById("status-filter")
        ?.addEventListener("change", (e) =>
          this.handleStatusFilter(e.target.value)
        );

      document
        .getElementById("clear-filters")
        ?.addEventListener("click", () => this.clearFilters());

      document.querySelectorAll("[data-sort]").forEach((header) => {
        header.addEventListener("click", (e) => {
          const column = e.currentTarget.dataset.sort;
          this.handleSort(column);
        });
      });

      console.log("Event listeners setup complete");
    }

    async loadAttendanceRecords() {
      this.showLoading();

      try {
        console.log("Fetching attendance records from API...");

        const response = await fetch(
          "/curriculum/InternshipAttendance/getall",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.isSuccess) {
          this.currentData = data.result || [];
          console.log(`Loaded ${this.currentData.length} attendance records`);

          this.updateStats();

          if (this.currentData.length > 0) {
            this.renderTable(this.currentData);
          } else {
            this.showEmptyState();
          }
        } else {
          throw new Error(data.error || "Failed to fetch attendance records");
        }
      } catch (error) {
        console.error("Error loading attendance records:", error);
        this.showError(error.message);
      }
    }

    updateStats() {
      const total = this.currentData.length;
      const onTime = this.currentData.filter(
        (record) =>
          record.check_in_status === true || record.check_in_status === "true"
      ).length;
      const late = total - onTime;

      document.getElementById("total-count").textContent = total;
      document.getElementById("on-time-count").textContent = onTime;
      document.getElementById("late-count").textContent = late;

      console.log(
        `Stats updated: Total=${total}, OnTime=${onTime}, Late=${late}`
      );
    }

    renderTable(attendanceRecords) {
      const tbody = document.getElementById("table-tbody");
      if (!tbody) {
        console.warn("Table body not found");
        return;
      }

      tbody.innerHTML = "";

      attendanceRecords.forEach((record) => {
        const row = this.createTableRow(record);
        tbody.appendChild(row);
      });

      this.showTable();
      console.log(`Rendered ${attendanceRecords.length} table rows`);
    }

    createTableRow(record) {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 transition-colors duration-150";

      this.columns.forEach((column) => {
        const td = document.createElement("td");
        td.className = `px-6 py-4 ${
          column.key === "actions" ? "whitespace-nowrap" : ""
        } text-sm text-gray-900`;

        let value = null;
        if (column.key === "id") {
          value = record.ID;
        } else if (column.key === "student_info") {
          value = null;
        } else if (column.key === "created_at") {
          value = record.CreatedAt;
        } else if (column.key === "actions") {
          value = null;
        } else {
          value = record[column.key];
        }

        if (column.render) {
          td.innerHTML = column.render(value, record);
        } else {
          td.textContent = value || "N/A";
        }

        tr.appendChild(td);
      });

      return tr;
    }

    createCheckInStatusBadge(status) {
      const isOnTime = status === true || status === "true";
      const badgeClass = isOnTime
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
      const displayText = isOnTime ? "On Time" : "Late";
      const iconSvg = isOnTime
        ? '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
        : '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';

      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">${iconSvg}${displayText}</span>`;
    }

    createAssignedWorkBadge(workStatus) {
      let badgeClass = "";
      let displayText = workStatus || "none";
      let iconSvg = "";

      switch (workStatus) {
        case "none":
          badgeClass = "bg-gray-100 text-gray-800";
          displayText = "None";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
          break;
        case "pending":
          badgeClass = "bg-yellow-100 text-yellow-800";
          displayText = "Pending";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';
          break;
        case "completed":
          badgeClass = "bg-green-100 text-green-800";
          displayText = "Completed";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
          break;
        default:
          badgeClass = "bg-gray-100 text-gray-800";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
      }

      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">${iconSvg}${displayText}</span>`;
    }

    handleSearch(searchTerm) {
      if (!searchTerm.trim()) {
        this.renderTable(this.currentData);
        return;
      }

      const filtered = this.currentData.filter((record) => {
        // Access nested student data
        const student = record.InternshipInformation?.InternStudent?.Student;
        const studentName = student
          ? `${student.first_name || ""} ${
              student.last_name || ""
            }`.toLowerCase()
          : "";
        const studentCode = student ? student.student_code.toLowerCase() : "";
        const search = searchTerm.toLowerCase();

        return studentName.includes(search) || studentCode.includes(search);
      });

      this.renderTable(filtered);
    }

    handleStatusFilter(status) {
      if (!status) {
        this.renderTable(this.currentData);
        return;
      }

      const filtered = this.currentData.filter(
        (record) => String(record.check_in_status) === status
      );
      this.renderTable(filtered);
    }

    clearFilters() {
      document.getElementById("search-input").value = "";
      document.getElementById("status-filter").value = "";
      this.sortColumn = null;
      this.sortDirection = "asc";
      this.renderTableHeaders();
      this.renderTable(this.currentData);
    }

    handleSort(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortColumn = column;
        this.sortDirection = "asc";
      }

      this.renderTableHeaders();

      const sortedData = [...this.currentData].sort((a, b) => {
        let aValue, bValue;

        switch (column) {
          case "id":
            aValue = a.ID;
            bValue = b.ID;
            break;
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "student_info":
            // Access nested student data for sorting
            aValue = a.InternshipInformation?.InternStudent?.Student
              ? `${
                  a.InternshipInformation.InternStudent.Student.first_name || ""
                } ${
                  a.InternshipInformation.InternStudent.Student.last_name || ""
                }`.trim()
              : "";
            bValue = b.InternshipInformation?.InternStudent?.Student
              ? `${
                  b.InternshipInformation.InternStudent.Student.first_name || ""
                } ${
                  b.InternshipInformation.InternStudent.Student.last_name || ""
                }`.trim()
              : "";
            break;
          case "check_in_time":
            aValue = a.check_in_time ? new Date(a.check_in_time).getTime() : 0;
            bValue = b.check_in_time ? new Date(b.check_in_time).getTime() : 0;
            break;
          case "check_out_time":
            aValue = a.check_out_time
              ? new Date(a.check_out_time).getTime()
              : 0;
            bValue = b.check_out_time
              ? new Date(b.check_out_time).getTime()
              : 0;
            break;
          case "check_in_status":
            aValue = a.check_in_status ? 1 : 0;
            bValue = b.check_in_status ? 1 : 0;
            break;
          case "assing_work":
            aValue = a.assing_work || "";
            bValue = b.assing_work || "";
            break;
          case "created_at":
            aValue = new Date(a.CreatedAt).getTime();
            bValue = new Date(b.CreatedAt).getTime();
            break;
          default:
            aValue = a[column] || "";
            bValue = b[column] || "";
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return this.sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return this.sortDirection === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
      });

      this.renderTable(sortedData);
    }

    showLoading() {
      const loading = document.getElementById("loading");
      const table = document.getElementById("table-container");
      const empty = document.getElementById("empty-state");
      const error = document.getElementById("error-message");

      if (loading) loading.classList.remove("hidden");
      if (table) table.classList.add("hidden");
      if (empty) empty.classList.add("hidden");
      if (error) error.classList.add("hidden");
    }

    showTable() {
      const loading = document.getElementById("loading");
      const table = document.getElementById("table-container");
      const empty = document.getElementById("empty-state");
      const error = document.getElementById("error-message");

      if (loading) loading.classList.add("hidden");
      if (table) table.classList.remove("hidden");
      if (empty) empty.classList.add("hidden");
      if (error) error.classList.add("hidden");
    }

    showEmptyState() {
      const loading = document.getElementById("loading");
      const table = document.getElementById("table-container");
      const empty = document.getElementById("empty-state");
      const error = document.getElementById("error-message");

      if (loading) loading.classList.add("hidden");
      if (table) table.classList.add("hidden");
      if (empty) empty.classList.remove("hidden");
      if (error) error.classList.add("hidden");
    }

    showError(message) {
      const loading = document.getElementById("loading");
      const table = document.getElementById("table-container");
      const empty = document.getElementById("empty-state");
      const error = document.getElementById("error-message");
      const errorText = document.getElementById("error-text");

      if (loading) loading.classList.add("hidden");
      if (table) table.classList.add("hidden");
      if (empty) empty.classList.add("hidden");
      if (error) error.classList.remove("hidden");
      if (errorText) errorText.textContent = message;
    }

    async viewAttendance(attendanceId) {
      try {
        const response = await fetch(
          `/curriculum/InternshipAttendance/GetInternshipAttendance/${attendanceId}`
        );
        const data = await response.json();

        if (data.isSuccess) {
          const record = data.result;
          // Access nested student data
          const student = record.InternshipInformation?.InternStudent?.Student;
          const studentName = student
            ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
            : "N/A";
          const studentCode = student ? student.student_code : "N/A";

          const details = `
Attendance Record Details:

ID: ${record.ID}
Date: ${new Date(record.date).toLocaleDateString()}
Student: ${studentName} (${studentCode})
Check-In Time: ${
            record.check_in_time
              ? new Date(record.check_in_time).toLocaleTimeString()
              : "N/A"
          }
Check-Out Time: ${
            record.check_out_time
              ? new Date(record.check_out_time).toLocaleTimeString()
              : "N/A"
          }
Status: ${record.check_in_status ? "On Time" : "Late"}
Assigned Work: ${record.assing_work || "None"}
Created: ${new Date(record.CreatedAt).toLocaleDateString()}
          `;

          alert(details);
        } else {
          this.showError(data.error || "Failed to load attendance details");
        }
      } catch (error) {
        console.error("Error viewing attendance:", error);
        this.showError("Failed to load attendance details");
      }
    }

    editAttendance(attendanceId) {
      console.log("Navigating to edit attendance:", attendanceId);
      window.location.hash = `#curriculum/internship/attendance/edit/${attendanceId}`;
    }

    async deleteAttendance(attendanceId) {
      if (!confirm("Are you sure you want to delete this attendance record?")) {
        return;
      }

      try {
        const response = await fetch(
          `/curriculum/InternshipAttendance/DeleteInternshipAttendance/${attendanceId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.isSuccess) {
          this.showSuccessMessage("Attendance record deleted successfully");
          await this.loadAttendanceRecords();
        } else {
          this.showError(data.error || "Failed to delete attendance record");
        }
      } catch (error) {
        console.error("Error deleting attendance:", error);
        this.showError("Failed to delete attendance record");
      }
    }

    showSuccessMessage(message) {
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50";
      successDiv.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">${message}</p>
          </div>
        </div>
      `;

      document.body.appendChild(successDiv);

      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 3000);
    }

    navigateToCreate() {
      window.location.hash = "#internship/internshipattendance/create";
    }
  }

  window.InternshipAttendanceList = InternshipAttendanceList;
  window.internshipAttendanceList = null;
}
