class AdvanceTableRender{
    constructor(application, options = {}) {
        this.application = application;
        this.schema = options.schema || null;
        this.data = options.data || [];
        this.targetSelector = options.targetSelector || "#MainContainer";
        this.modelPath = options.modelPath || null;
        this.dataPath = options.dataPath || null;
        this.customColumns = options.customColumns || [];
        this.table = null;
        this.isLoading = false;
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
            this.data = await response.json();
            return this.data;
        } finally {
            this.isLoading = false;
        }
    }

    // Main render method
    async render() {
        if (!this.schema) await this.loadSchema();
        if (!this.data) await this.loadData();

        // Make sure templates are loaded
        if (!this.application.template) {
            await this.application.fetchTemplate();
        }

        // Create table using template
        this.createTable();
        this.renderHeaders();
        this.renderRows();
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

    // Render table rows
    renderRows() {
        const columns = this.getAllColumns();
        
        for (const [index, rowData] of this.data.entries()) {
            const row = new DOMObject(this.application.template.TableRow, {
                striped: index % 2 === 1,
                hoverable: true
            }, false);
            
            // Add cells to row
            for (const column of columns) {
                const cell = this.createCell(column, rowData, index);
                row.html.appendChild(cell.html);
            }
            
            this.table.dom.tbody.append(row);
        }
    }

    // Create table cell using template
    createCell(column, rowData, index) {
        if (column.template) {
            // Custom template - replace {field} with data
            const content = this.bindTemplate(column.template, rowData, index);
            return new DOMObject(this.application.template.TableCell, {
                template: true,
                content: content
            }, false);
        } else {
            // Regular data field//ไม่มี template//
            const value = rowData[column.name];
            return new DOMObject(this.application.template.TableCell, {
                template: false,
                value: this.formatValue(value, column.type)
            }, false);
        }
    }

    // Replace {field} in template with actual data
    bindTemplate(template, rowData, index) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            if (key === 'index') return index;
            return rowData[key] || '';
        });
    }

    // Format values based on type
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

    // Get all columns (schema + custom)
    getAllColumns() {
        const schemaColumns = this.schema.filter(col =>
            col.type !== 'hidden' && col.type !== '-' && col.display !== false
        );
        return [...schemaColumns, ...this.customColumns];
    }

    // Mount table to container
    mountTable() {
        const container = document.querySelector(this.targetSelector);
        if (!container) throw new Error(`Container ${this.targetSelector} not found`);
        
        container.innerHTML = '';
        container.appendChild(this.table.html);
    }

    // Update data and re-render
    setData(newData) {
        this.data = newData;
        this.render();
    }

    // Add custom column
    addCustomColumn(column) {
        this.customColumns.push(column);
    }

    // Refresh from API
    async refresh() {
        await this.loadData();
        this.render();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvanceTableRender;
} else {
    window.AdvanceTableRender = AdvanceTableRender;
}
