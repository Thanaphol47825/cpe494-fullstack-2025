class AdvanceTableRender{
    constructor(application, options = {}) {
        this.application = application;
        this.schema = options.schema || null;
        this.data = options.data || [];
        this.originalData = []; // เก็บข้อมูลเต็มไว้สำหรับ filter/sort
        this.targetSelector = options.targetSelector || "#MainContainer";
        this.modelPath = options.modelPath || null;
        this.dataPath = options.dataPath || null;
        this.customColumns = options.customColumns || [];
        this.table = null;
        this.isLoading = false;

        // --- Search (โหมดเดียว: dropdown + All) ---
        this.enableSearch = options.enableSearch || false;
        this.searchConfig = {
            placeholder: "Search...",
            fields: null,           // ถ้าไม่กำหนด จะ auto จาก schema
            ...(options.searchConfig || {})
        };
        this.selectedSearchField = "all";  // "all" = ทุกคอลัมน์
        this.searchKeyword = "";

        // --- Pagination ---
        this.enablePagination = options.enablePagination || false;
        this.pageSize = options.pageSize || 10;
        this.currentPage = 1;
        this.paginationElement = null;
        this.searchInput = null;

        // --- Sorting ---
        this.enableSorting = options.enableSorting !== undefined ? options.enableSorting : true;
        this.sortConfig = options.sortConfig || {
            defaultField: null,
            defaultDirection: "asc"
        };
        this.sortField = this.sortConfig.defaultField;
        this.sortDirection = this.sortConfig.defaultDirection || "asc";
    }

    // Load schema from API (same as AdvanceFormRender)
    async loadSchema(modelPath = null) {
        const path = modelPath || this.modelPath;
        if (!path) throw new Error("Model path required");
        
        this.isLoading = true;
        try {
            let response = await fetch(`${RootURL}/api/formschema/${path}`);
            if (!response.ok) {
                response = await fetch(`${RootURL}/api/modelmeta/${path}`);
            }
            this.schema = await response.json();
            return this.schema;
        } finally {
            this.isLoading = false;
        }
    }

    // Load data from API
    async loadData(dataPath = null) {
        const path = dataPath || this.dataPath;
        if (!path) throw new Error("Data path required");
        
        this.isLoading = true;
        try {
            const response = await fetch(`${RootURL}/api/data/${path}`);
            const data = await response.json();
            this.originalData = Array.isArray(data) ? data : [];
            this.data = [...this.originalData];
            return this.data;
        } finally {
            this.isLoading = false;
        }
    }

    // Main render method
    async render() {
        if (!this.schema) {
            await this.loadSchema();
        }

        // ถ้ายังไม่มี data และมี dataPath ให้โหลดจาก API
        if ((!this.data || this.data.length === 0) && this.dataPath) {
            await this.loadData();
        } else if (this.originalData.length === 0) {
            // ถ้า dev setData มาก่อน ให้ถือว่าข้อมูลนั้นคือ originalData
            this.originalData = Array.isArray(this.data) ? [...this.data] : [];
        }

        // Make sure templates are loaded
        if (!this.application.template) {
            await this.application.fetchTemplate();
        }

        // Create table using template
        this.createTable();
        this.renderHeaders();
        this.renderRows();        // ใช้ข้อมูลแบบ filter + sort + paginate
        this.mountTable();
    }

    // Create main table structure using template
    createTable() {
        this.table = new DOMObject(this.application.template.Table, {
            responsive: true,
            striped: true
        }, false);
    }

    // Render table headers
    renderHeaders() {
        const columns = this.getAllColumns();
        
        for (const column of columns) {
            const header = new DOMObject(this.application.template.TableColumn, {
                label: column.label || column.name
            }, false);
            
            this.table.dom.headerRow.append(header);
        }
    }

    // ----------------- FILTER + SORT + PAGINATE -----------------
    getFilteredData() {
        const keyword = (this.searchKeyword || "").toLowerCase().trim();
        if (!keyword) {
            return this.originalData;
        }

        let searchFields = [];

        if (this.searchConfig && Array.isArray(this.searchConfig.fields) && this.searchConfig.fields.length > 0) {
            searchFields = this.searchConfig.fields
                .map(f => f.value)
                .filter(v => v && v !== "all");
        } else if (this.schema) {
            searchFields = this.schema.map(col => col.name);
        } else if (this.originalData.length > 0) {
            searchFields = Object.keys(this.originalData[0]);
        }

        return this.originalData.filter(row => {
            if (this.selectedSearchField && this.selectedSearchField !== "all") {
                const val = row[this.selectedSearchField];
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(keyword);
            }

            return searchFields.some(fieldName => {
                const val = row[fieldName];
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(keyword);
            });
        });
    }

    getSortedData(data) {
        if (!this.enableSorting || !this.sortField) {
            return data;
        }

        const direction = this.sortDirection === "desc" ? -1 : 1;

        const sorted = [...data].sort((a, b) => {
            let va = a[this.sortField];
            let vb = b[this.sortField];

            if (va == null && vb == null) return 0;
            if (va == null) return -1 * direction;
            if (vb == null) return 1 * direction;

            const na = Number(va);
            const nb = Number(vb);
            const bothNumeric = !isNaN(na) && !isNaN(nb);

            if (bothNumeric) {
                if (na < nb) return -1 * direction;
                if (na > nb) return 1 * direction;
                return 0;
            }

            va = String(va).toLowerCase();
            vb = String(vb).toLowerCase();

            if (va < vb) return -1 * direction;
            if (va > vb) return 1 * direction;
            return 0;
        });

        return sorted;
    }

    getPagedData() {
        const filtered = this.getFilteredData();
        const sorted = this.getSortedData(filtered);

        if (!this.enablePagination) {
            this.data = sorted;
            return this.data;
        }

        const totalItems = sorted.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) this.currentPage = 1;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;

        this.data = sorted.slice(start, end);
        return this.data;
    }


    renderRows() {
        const columns = this.getAllColumns();
        const rowsData = this.getPagedData();

        this.table.dom.tbody.innerHTML = "";

        for (const [index, rowData] of rowsData.entries()) {
            const row = new DOMObject(this.application.template.TableRow, {
                striped: index % 2 === 1,
                hoverable: true
            }, false);
            
            for (const column of columns) {
                const cell = this.createCell(column, rowData, index);
                row.html.appendChild(cell.html);
            }
            
            this.table.dom.tbody.append(row);
        }

        if (this.enablePagination && this.paginationElement) {
            this.renderPaginationControls();
        }
    }

    createCell(column, rowData, index) {
        if (column.template) {
            const content = this.bindTemplate(column.template, rowData, index);
            return new DOMObject(this.application.template.TableCell, {
                template: true,
                content: content
            }, false);
        } else {
            const value = rowData[column.name];
            return new DOMObject(this.application.template.TableCell, {
                template: false,
                value: this.formatValue(value, column.type)
            }, false);
        }
    }

    bindTemplate(template, rowData, index) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            if (key === 'index') return index;
            return rowData[key] || '';
        });
    }

    formatValue(value, type) {
        if (value === null || value === undefined) return '';
        
        switch (type) {
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'datetime':
                return new Date(value).toLocaleString();
            case 'boolean':
                return value ? 'Yes' : 'No';
            case 'number':
                return typeof value === 'number' ? value.toLocaleString() : value;
            default:
                return String(value);
        }
    }

    getAllColumns() {
        const schemaColumns = this.schema.filter(col =>
            col.type !== 'hidden' && col.type !== '-' && col.display !== false
        );
        return [...schemaColumns, ...this.customColumns];
    }

    // ----------------- TOP BAR + PAGINATION -----------------

    mountTable() {
        const container = document.querySelector(this.targetSelector);
        if (!container) throw new Error(`Container ${this.targetSelector} not found`);
        
        container.innerHTML = '';

        const wrapper = document.createElement("div");
        wrapper.className = "advance-table-wrapper space-y-2";

        if (this.enableSearch || this.enableSorting) {
            const topBar = document.createElement("div");
            topBar.className = "flex flex-col md:flex-row md:items-center md:justify-between gap-2";

            const leftControls = document.createElement("div");
            leftControls.className = "flex items-center gap-2 w-full md:w-auto";

            const rightControls = document.createElement("div");
            rightControls.className = "flex items-center gap-2 w-full md:w-auto md:justify-end";

            // --- Search controls 
            if (this.enableSearch) {
                const searchSelect = document.createElement("select");
                searchSelect.className = "border px-2 py-1 rounded text-sm";

                let options = [];

                if (Array.isArray(this.searchConfig.fields) && this.searchConfig.fields.length > 0) {
                    options = this.searchConfig.fields;
                } else if (this.schema) {
                    options = this.schema.map(col => ({
                        value: col.name,
                        label: col.label || col.name
                    }));
                } else if (this.originalData.length > 0) {
                    options = Object.keys(this.originalData[0]).map(k => ({
                        value: k,
                        label: k
                    }));
                }

                options = [
                    { value: "all", label: "All" },
                    ...options.filter(o => o.value !== "all")
                ];

                options.forEach(f => {
                    const opt = document.createElement("option");
                    opt.value = f.value;
                    opt.textContent = f.label;
                    if (f.value === this.selectedSearchField) {
                        opt.selected = true;
                    }
                    searchSelect.appendChild(opt);
                });

                searchSelect.addEventListener("change", () => {
                    this.selectedSearchField = searchSelect.value;
                    this.currentPage = 1;
                    this.renderRows();
                });

                leftControls.appendChild(searchSelect);

                // input สำหรับ keyword
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = this.searchConfig.placeholder || "Search...";
                input.value = this.searchKeyword;
                input.className = "border px-2 py-1 rounded w-full md:w-64";
                this.searchInput = input;

                const searchBtn = document.createElement("button");
                searchBtn.textContent = "Search";
                searchBtn.className = "px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200";

                const runSearch = () => {
                    this.searchKeyword = input.value;
                    this.currentPage = 1;
                    this.renderRows();
                };

                searchBtn.addEventListener("click", runSearch);
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        runSearch();
                    }
                });

                leftControls.appendChild(input);
                leftControls.appendChild(searchBtn);
            }

            // --- Sort controls ---
            if (this.enableSorting) {
                const sortLabel = document.createElement("span");
                sortLabel.textContent = "Sort by";
                sortLabel.className = "text-sm text-gray-600";

                const sortSelect = document.createElement("select");
                sortSelect.className = "border px-2 py-1 rounded text-sm";

                const noneOpt = document.createElement("option");
                noneOpt.value = "";
                noneOpt.textContent = "None";
                sortSelect.appendChild(noneOpt);

                if (this.schema) {
                    this.schema.forEach(col => {
                        const opt = document.createElement("option");
                        opt.value = col.name;
                        opt.textContent = col.label || col.name;
                        if (col.name === this.sortField) {
                            opt.selected = true;
                        }
                        sortSelect.appendChild(opt);
                    });
                }

                sortSelect.addEventListener("change", () => {
                    const val = sortSelect.value;
                    this.sortField = val || null;
                    this.currentPage = 1;
                    this.renderRows();
                });

                const directionBtn = document.createElement("button");
                const updateDirBtnText = () => {
                    directionBtn.textContent = this.sortDirection === "asc" ? "Asc ▲" : "Desc ▼";
                };
                directionBtn.className = "px-2 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200 w-20";
                updateDirBtnText();

                directionBtn.addEventListener("click", () => {
                    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
                    this.currentPage = 1;
                    updateDirBtnText();
                    this.renderRows();
                });

                rightControls.appendChild(sortLabel);
                rightControls.appendChild(sortSelect);
                rightControls.appendChild(directionBtn);
            }

            if (this.enableSearch) topBar.appendChild(leftControls);
            if (this.enableSorting) topBar.appendChild(rightControls);

            wrapper.appendChild(topBar);
        }

        // Table
        wrapper.appendChild(this.table.html);

        // Pagination
        if (this.enablePagination) {
            const paginationWrapper = document.createElement("div");
            paginationWrapper.className = "advance-table-pagination flex items-center justify-between mt-2 text-sm";
            this.paginationElement = paginationWrapper;
            this.renderPaginationControls();
            wrapper.appendChild(paginationWrapper);
        }

        container.appendChild(wrapper);
    }

    // pagination buttons
    renderPaginationControls() {
        if (!this.paginationElement) return;

        const filtered = this.getFilteredData();
        const sorted = this.getSortedData(filtered);
        const totalItems = sorted.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));

        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        this.paginationElement.innerHTML = "";

        const infoSpan = document.createElement("span");
        infoSpan.textContent = `Page ${this.currentPage} / ${totalPages}  (Total: ${totalItems})`;

        const controls = document.createElement("div");
        controls.className = "space-x-2";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.className = "px-2 py-1 border rounded";
        prevBtn.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderRows();
            }
        });

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.className = "px-2 py-1 border rounded";
        nextBtn.addEventListener("click", () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderRows();
            }
        });

        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);

        this.paginationElement.appendChild(infoSpan);
        this.paginationElement.appendChild(controls);
    }

    setData(newData) {
        this.originalData = Array.isArray(newData) ? [...newData] : [];
        this.currentPage = 1;
        if (this.table) {
            this.renderRows();
        } else {
            this.data = [...this.originalData];
            this.render();
        }
    }

    addCustomColumn(column) {
        this.customColumns.push(column);
    }

    async refresh() {
        await this.loadData();
        if (this.table) {
            this.currentPage = 1;
            this.renderRows();
        } else {
            this.render();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvanceTableRender;
} else {
    window.AdvanceTableRender = AdvanceTableRender;
}
