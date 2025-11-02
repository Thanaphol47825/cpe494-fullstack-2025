if (typeof window !== "undefined" && !window.InternStudentList) {
  class InternStudentList {
    constructor(application) {
      this.application = application;
      this.tableManager = null;
      this.currentData = [];
      this.sortColumn = null;
      this.sortDirection = "asc";
      this.templates = {
        main: null,
        stat: null,
      };

      // Define table columns configuration
      this.columns = this.getColumnDefinitions();

      // Define status filter options
      this.statusFilterOptions = this.getStatusFilterOptions();
    }

    /**
     * Define status filter options
     * Customize these options as needed
     */
    getStatusFilterOptions() {
      return [
        { value: "", label: "All Status" },
        { value: "NOT_STARTED", label: "Not Started" },
        { value: "ACTIVE", label: "Active" },
        { value: "COMPLETED", label: "Completed" },
      ];
    }

    /**
     * Define which columns to display and their configuration
     * You can customize this method to show/hide columns or change their order
     */
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
          key: "student_code",
          label: "Student Code",
          sortable: true,
          width: "w-32",
          align: "left",
          render: (value, row) => {
            const code = row.Student ? row.Student.student_code : "N/A";
            return `<div class="font-medium">${code}</div>`;
          },
        },
        {
          key: "student_name",
          label: "Student Name",
          sortable: true,
          width: "w-48",
          align: "left",
          render: (value, row) => {
            const studentName = row.Student
              ? `${row.Student.first_name || ""} ${
                  row.Student.last_name || ""
                }`.trim() || "N/A"
              : "N/A";

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
                </div>
              </div>
            `;
          },
        },
        {
          key: "intern_status",
          label: "Status",
          sortable: true,
          width: "w-32",
          align: "left",
          render: (value, row) => this.createStatusBadge(value),
        },
        {
          key: "overview",
          label: "Overview",
          sortable: false,
          width: "w-64",
          align: "left",
          render: (value, row) => {
            return `
              <div class="max-w-xs truncate" title="${value || "No overview"}">
                ${
                  value ||
                  '<span class="text-gray-400 italic">No overview</span>'
                }
              </div>
            `;
          },
        },
        {
          key: "created_at",
          label: "Created At",
          sortable: true,
          width: "w-36",
          align: "left",
          render: (value, row) => {
            return new Date(row.CreatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          },
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          width: "w-48",
          align: "right",
          render: (value, row) => {
            return `
              <div class="flex justify-end space-x-2">
                <button type="button" class="text-blue-600 hover:text-blue-900 transition-colors duration-150" onclick="if(window.internStudentList) window.internStudentList.viewIntern(${row.ID})">
                  View
                </button>
                <button type="button" class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" onclick="if(window.internStudentList) window.internStudentList.editIntern(${row.ID})">
                  Edit
                </button>
                <button type="button" class="text-red-600 hover:text-red-900 transition-colors duration-150" onclick="if(window.internStudentList) window.internStudentList.deleteIntern(${row.ID})">
                  Delete
                </button>
              </div>
            `;
          },
        },
      ];
    }

    /**
     * Customize columns for different views
     * Example: Minimal view with fewer columns
     */
    getMinimalColumnDefinitions() {
      return this.columns.filter((col) =>
        ["id", "student_name", "intern_status", "actions"].includes(col.key)
      );
    }

    /**
     * Set which columns to display
     * @param {Array} columnKeys - Array of column keys to display
     */
    setVisibleColumns(columnKeys) {
      const allColumns = this.getColumnDefinitions();
      this.columns = allColumns.filter((col) => columnKeys.includes(col.key));
    }

    async loadTemplates() {
      try {
        const mainResponse = await fetch(
          "/curriculum/static/view/InternshipTableTemplate.tpl"
        );
        if (!mainResponse.ok) {
          throw new Error(
            `Failed to load main template: ${mainResponse.status}`
          );
        }
        this.templates.main = await mainResponse.text();

        const statResponse = await fetch(
          "/curriculum/static/view/InternshipStatusTemplate.tpl"
        );
        if (!statResponse.ok) {
          throw new Error(
            `Failed to load stat template: ${statResponse.status}`
          );
        }
        this.templates.stat = await statResponse.text();
      } catch (error) {
        console.error("Error loading templates:", error);
        throw error;
      }
    }

    async render() {
      console.log("Rendering Intern Student List");

      window.internStudentList = this;

      this.application.mainContainer.innerHTML = "";

      try {
        await this.loadTemplates();

        const pageData = {
          page_title: "Intern Students",
          page_description: "Manage and view all intern students",
        };
        const pageHTML = Mustache.render(this.templates.main, pageData);
        const pageWrapper = this.application.create(pageHTML);
        this.application.mainContainer.appendChild(pageWrapper);

        // Populate status filter options
        this.populateStatusFilter();

        this.renderStatsSection();
        this.renderTableHeaders();
        this.setupEventListeners();

        await this.loadInternStudents();
      } catch (error) {
        console.error("Error rendering intern student list:", error);
        this.showError("Failed to load page: " + error.message);
      }
    }

    /**
     * Populate status filter dropdown with options from getStatusFilterOptions()
     */
    populateStatusFilter() {
      const statusFilter = document.getElementById("status-filter");
      if (!statusFilter) return;

      statusFilter.innerHTML = "";

      this.statusFilterOptions.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        statusFilter.appendChild(optionElement);
      });
    }

    renderStatsSection() {
      const statsContainer = document.getElementById("stats-section");
      if (!statsContainer) return;

      const stats = [
        {
          stat_label: "Total Interns",
          stat_id: "total-count",
          stat_value: "0",
          icon_bg_color: "bg-blue-100",
          icon_text_color: "text-blue-600",
          icon_path:
            "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025",
        },
        {
          stat_label: "Active",
          stat_id: "active-count",
          stat_value: "0",
          icon_bg_color: "bg-green-100",
          icon_text_color: "text-green-600",
          icon_path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          stat_label: "Completed",
          stat_id: "completed-count",
          stat_value: "0",
          icon_bg_color: "bg-indigo-100",
          icon_text_color: "text-indigo-600",
          icon_path:
            "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        },
      ];

      statsContainer.innerHTML = "";
      stats.forEach((stat) => {
        const statHTML = Mustache.render(this.templates.stat, stat);
        const statElement = this.application.create(statHTML);
        statsContainer.appendChild(statElement);
      });
    }

    renderTableHeaders() {
      const headerRow = document.getElementById("table-header");
      if (!headerRow) return;

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
    }

    setupEventListeners() {
      document
        .getElementById("refresh-btn")
        ?.addEventListener("click", () => this.loadInternStudents());

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
    }

    async loadInternStudents() {
      this.showLoading();

      try {
        const response = await fetch("/curriculum/InternStudent", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.isSuccess) {
          this.currentData = data.result || [];
          this.updateStats();

          if (this.currentData.length > 0) {
            this.renderTable(this.currentData);
          } else {
            this.showEmptyState();
          }
        } else {
          throw new Error(data.error || "Failed to fetch intern students");
        }
      } catch (error) {
        console.error("Error loading intern students:", error);
        this.showError(error.message);
      }
    }

    updateStats() {
      const total = this.currentData.length;
      const active = this.currentData.filter(
        (intern) => intern.intern_status === "ACTIVE"
      ).length;
      const completed = this.currentData.filter(
        (intern) => intern.intern_status === "COMPLETED"
      ).length;

      document.getElementById("total-count").textContent = total;
      document.getElementById("active-count").textContent = active;
      document.getElementById("completed-count").textContent = completed;
    }

    renderTable(internStudents) {
      const tbody = document.getElementById("table-tbody");
      if (!tbody) return;

      tbody.innerHTML = "";

      internStudents.forEach((intern) => {
        const row = this.createTableRow(intern);
        tbody.appendChild(row);
      });

      this.showTable();
    }

    createTableRow(intern) {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 transition-colors duration-150";

      this.columns.forEach((column) => {
        const td = document.createElement("td");
        td.className = `px-6 py-4 ${
          column.key === "actions" ? "whitespace-nowrap" : ""
        } text-sm text-gray-900`;

        // Get the value for this column
        let value = null;
        if (column.key === "id") {
          value = intern.ID;
        } else if (
          column.key === "student_code" ||
          column.key === "student_name"
        ) {
          value = null; // Will be handled by render function
        } else if (column.key === "created_at") {
          value = intern.CreatedAt;
        } else if (column.key === "actions") {
          value = null; // Actions don't need a value
        } else {
          value = intern[column.key];
        }

        // Use the column's render function to generate HTML
        if (column.render) {
          td.innerHTML = column.render(value, intern);
        } else {
          td.textContent = value || "N/A";
        }

        tr.appendChild(td);
      });

      return tr;
    }

    createStatusBadge(status) {
      let badgeClass = "";
      let displayText = status;
      let iconSvg = "";

      switch (status) {
        case "NOT_STARTED":
          badgeClass = "bg-gray-100 text-gray-800";
          displayText = "Not Started";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';
          break;
        case "ACTIVE":
          badgeClass = "bg-green-100 text-green-800";
          displayText = "Active";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
          break;
        case "COMPLETED":
          badgeClass = "bg-blue-100 text-blue-800";
          displayText = "Completed";
          iconSvg =
            '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
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

      const filtered = this.currentData.filter((intern) => {
        const studentName = intern.Student
          ? `${intern.Student.first_name || ""} ${
              intern.Student.last_name || ""
            }`.toLowerCase()
          : "";
        const studentCode = intern.Student
          ? intern.Student.student_code.toLowerCase()
          : "";
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
        (intern) => intern.intern_status === status
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
          case "student_code":
            aValue = a.Student?.student_code || "";
            bValue = b.Student?.student_code || "";
            break;
          case "student_name":
            aValue = a.Student
              ? `${a.Student.first_name || ""} ${
                  a.Student.last_name || ""
                }`.trim()
              : "";
            bValue = b.Student
              ? `${b.Student.first_name || ""} ${
                  b.Student.last_name || ""
                }`.trim()
              : "";
            break;
          case "intern_status":
            aValue = a.intern_status || "";
            bValue = b.intern_status || "";
            break;
          case "created_at":
            aValue = new Date(a.CreatedAt).getTime();
            bValue = new Date(b.CreatedAt).getTime();
            break;
          default:
            aValue = a[column] || "";
            bValue = b[column] || "";
        }

        // Handle string vs number comparison
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
      document.getElementById("loading")?.classList.remove("hidden");
      document.getElementById("table-container")?.classList.add("hidden");
      document.getElementById("empty-state")?.classList.add("hidden");
      document.getElementById("error-message")?.classList.add("hidden");
    }

    showTable() {
      document.getElementById("loading")?.classList.add("hidden");
      document.getElementById("table-container")?.classList.remove("hidden");
      document.getElementById("empty-state")?.classList.add("hidden");
      document.getElementById("error-message")?.classList.add("hidden");
    }

    showEmptyState() {
      document.getElementById("loading")?.classList.add("hidden");
      document.getElementById("table-container")?.classList.add("hidden");
      document.getElementById("empty-state")?.classList.remove("hidden");
      document.getElementById("error-message")?.classList.add("hidden");
    }

    showError(message) {
      document.getElementById("loading")?.classList.add("hidden");
      document.getElementById("table-container")?.classList.add("hidden");
      document.getElementById("empty-state")?.classList.add("hidden");

      const errorMessage = document.getElementById("error-message");
      const errorText = document.getElementById("error-text");

      if (errorText) errorText.textContent = message;
      if (errorMessage) errorMessage.classList.remove("hidden");
    }

    async viewIntern(internId) {
      try {
        const response = await fetch(`/curriculum/InternStudent/${internId}`);
        const data = await response.json();

        if (data.isSuccess) {
          const intern = data.result;
          const studentName = intern.Student
            ? `${intern.Student.first_name || ""} ${
                intern.Student.last_name || ""
              }`.trim()
            : "N/A";
          const studentCode = intern.Student
            ? intern.Student.student_code
            : "N/A";

          const details = `
Intern Student Details:

ID: ${intern.ID}
Student Code: ${studentCode}
Student Name: ${studentName}
Status: ${intern.intern_status}
Overview: ${intern.overview || "No overview"}
Created: ${new Date(intern.CreatedAt).toLocaleDateString()}
          `;

          alert(details);
        } else {
          this.showError(data.error || "Failed to load intern details");
        }
      } catch (error) {
        console.error("Error viewing intern:", error);
        this.showError("Failed to load intern details");
      }
    }

    editIntern(internId) {
      console.log("Navigating to edit intern:", internId);
      // Navigate to edit page - modify the route based on your routing configuration
      window.location.hash = `#internship/internstudent/edit/${internId}`;
    }

    async deleteIntern(internId) {
      if (!confirm("Are you sure you want to delete this intern student?")) {
        return;
      }

      try {
        const response = await fetch(`/curriculum/InternStudent/${internId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (data.isSuccess) {
          this.showSuccessMessage("Intern student deleted successfully");
          await this.loadInternStudents();
        } else {
          this.showError(data.error || "Failed to delete intern student");
        }
      } catch (error) {
        console.error("Error deleting intern:", error);
        this.showError("Failed to delete intern student");
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
      window.location.hash = "#internship/internstudent/create";
    }

    async renderCreateForm() {
      console.log("Rendering create form");
    }
  }

  window.InternStudentList = InternStudentList;
  window.internStudentList = null;
}
