# FormRenderV2 & TableRenderV2 - Complete Usage Guide

## Overview

Both classes follow the same pattern:
- **Load schema** from `modelPath` (form metadata)
- **Use templates** for consistent UI rendering
- **Automatic data binding** with validation
- **Simple configuration** with sensible defaults

---

## FormRenderV2 - Dynamic Form Generator

### Basic Usage

```javascript
// Simple form with automatic schema loading
const form = new FormRenderV2(application, {
    modelPath: "curriculum/Student",     // API: /api/modelmeta/curriculum/Student
    targetSelector: "#form-container",   // Where to render
    submitUrl: "/api/save/student"       // Where to submit
});

await form.render();
```

### Advanced Configuration

```javascript
const form = new FormRenderV2(application, {
    modelPath: "hr/Employee",
    targetSelector: "#employee-form",
    submitUrl: "/api/employees/create",
    method: "POST",
    
    // Form behavior
    autoFocus: true,        // Focus first field
    showErrors: true,       // Show validation errors
    validateOnBlur: true,   // Validate on field blur
    
    // Custom submit handler
    submitHandler: async (formData, event, formInstance) => {
        console.log("Form data:", formData);
        // Your custom submit logic
        await saveEmployee(formData);
        formInstance.showFormSuccess("Employee saved!");
    }
});

await form.render();
```

### Supported Field Types

- **Text inputs**: `text`, `email`, `tel`, `url`, `password`, `number`
- **Date/time**: `date`, `datetime-local`, `time`
- **Selection**: `select` (dropdown), `radio` (radio buttons)
- **Text areas**: `textarea`
- **Checkboxes**: `checkbox`

### Schema Format

```json
[
    {
        "name": "first_name",
        "label": "First Name",
        "type": "text",
        "required": true,
        "placeholder": "Enter first name"
    },
    {
        "name": "email",
        "label": "Email Address", 
        "type": "email",
        "required": true
    },
    {
        "name": "department",
        "label": "Department",
        "type": "select",
        "required": true,
        "data": [
            {"label": "Engineering", "value": "eng"},
            {"label": "Marketing", "value": "mkt"}
        ]
    },
    {
        "name": "is_active",
        "label": "Active Employee",
        "type": "checkbox"
    }
]
```

### Methods

```javascript
// Render form
await form.render();

// Get form data
const data = form.getFormData();

// Set form data
form.setData({
    first_name: "John",
    email: "john@example.com",
    is_active: true
});

// Validate form
const isValid = form.validateForm();

// Reset form
form.reset();

// Show messages
form.showFormSuccess("Success!");
form.showFormError("Error occurred");

// Cleanup
form.destroy();
```

---

## TableRenderV2 - Dynamic Table Generator

### Basic Usage

```javascript
// Simple table with automatic schema and data loading
const table = new TableRenderV2(application, {
    modelPath: "curriculum/Student",     // Schema: /api/modelmeta/curriculum/Student
    dataPath: "curriculum/students",     // Data: /api/data/curriculum/students
    targetSelector: "#table-container"
});

await table.render();
```

### With Custom Action Columns

```javascript
const table = new TableRenderV2(application, {
    modelPath: "hr/Employee",
    dataPath: "hr/employees",
    targetSelector: "#employee-table",
    
    // Add custom columns (actions, computed fields, etc.)
    customColumns: [
        {
            name: "full_name",
            label: "Full Name",
            template: "{first_name} {last_name}"
        },
        {
            name: "actions",
            label: "Actions",
            template: `
                <div class="flex space-x-2">
                    <button onclick="editEmployee({id})" 
                            class="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                    </button>
                    <button onclick="viewProfile({id})" 
                            class="bg-green-500 text-white px-3 py-1 rounded text-sm">
                        Profile
                    </button>
                    <button onclick="deleteEmployee({id})" 
                            class="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            onclick="return confirm('Delete {first_name}?')">
                        Delete
                    </button>
                </div>
            `
        },
        {
            name: "status_badge",
            label: "Status",
            template: `
                <span class="px-2 py-1 rounded text-xs 
                    {status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {status}
                </span>
            `
        }
    ]
});

await table.render();
```

### Data Binding in Templates

Use `{field_name}` to bind row data:

```javascript
// Row data example:
{
    "id": 123,
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "department_id": 5,
    "status": "active"
}

// Template examples:
template: "{first_name} {last_name}"                    // → "John Doe"
template: "<a href='/user/{id}'>Profile</a>"           // → <a href='/user/123'>Profile</a>
template: "onclick='edit({id}, \"{email}\")'"          // → onclick='edit(123, "john@example.com")'
template: "<span class='badge-{status}'>{status}</span>" // → <span class='badge-active'>active</span>
```

### Schema + Data Format

**Schema (from modelPath):**
```json
[
    {
        "name": "id",
        "label": "ID",
        "type": "number",
        "display": false
    },
    {
        "name": "first_name",
        "label": "First Name", 
        "type": "text"
    },
    {
        "name": "created_at",
        "label": "Created",
        "type": "datetime"
    },
    {
        "name": "is_active",
        "label": "Active",
        "type": "boolean"
    }
]
```

**Data (from dataPath):**
```json
[
    {
        "id": 1,
        "first_name": "John",
        "email": "john@example.com",
        "created_at": "2024-01-15T10:30:00Z",
        "is_active": true
    },
    {
        "id": 2,
        "first_name": "Jane", 
        "email": "jane@example.com",
        "created_at": "2024-01-16T14:20:00Z",
        "is_active": false
    }
]
```

### Methods

```javascript
// Render table
await table.render();

// Set new data (directly)
table.setData(newEmployeeData);

// Add custom column
table.addCustomColumn({
    name: "export",
    label: "Export",
    template: `<button onclick="exportUser({id})">PDF</button>`
}).render();

// Refresh from API
await table.refresh();
```

---

## Common Patterns

### 1. Master-Detail View

```javascript
// List view (table)
const employeeTable = new TableRenderV2(application, {
    modelPath: "hr/Employee",
    dataPath: "hr/employees",
    customColumns: [{
        name: "actions",
        label: "Actions", 
        template: `<button onclick="editEmployee({id})">Edit</button>`
    }]
});

// Edit form
async function editEmployee(id) {
    const employeeForm = new FormRenderV2(application, {
        modelPath: "hr/Employee",
        submitHandler: async (data) => {
            await updateEmployee(id, data);
            await employeeTable.refresh(); // Refresh list
        }
    });
    
    // Load existing data
    const employee = await fetchEmployee(id);
    await employeeForm.render();
    employeeForm.setData(employee);
}
```

### 2. Search & Filter

```javascript
// Search form
const searchForm = new FormRenderV2(application, {
    schema: [
        {name: "search", label: "Search", type: "text"},
        {name: "department", label: "Department", type: "select", data: departments}
    ],
    submitHandler: async (searchData) => {
        // Update table with search results
        const results = await searchEmployees(searchData);
        employeeTable.setData(results);
    }
});

// Results table
const employeeTable = new TableRenderV2(application, {
    modelPath: "hr/Employee",
    data: [] // Start empty, populated by search
});
```

### 3. CRUD Operations

```javascript
class EmployeeManager {
    constructor(application) {
        this.application = application;
        this.setupTable();
        this.setupForm();
    }
    
    setupTable() {
        this.table = new TableRenderV2(this.application, {
            modelPath: "hr/Employee",
            dataPath: "hr/employees",
            customColumns: [{
                name: "actions",
                label: "Actions",
                template: `
                    <button onclick="employeeManager.edit({id})">Edit</button>
                    <button onclick="employeeManager.delete({id})">Delete</button>
                `
            }]
        });
    }
    
    setupForm() {
        this.form = new FormRenderV2(this.application, {
            modelPath: "hr/Employee",
            submitHandler: async (data) => {
                await this.save(data);
            }
        });
    }
    
    async edit(id) {
        const employee = await fetchEmployee(id);
        await this.form.render();
        this.form.setData(employee);
    }
    
    async save(data) {
        await saveEmployee(data);
        await this.table.refresh();
        this.form.reset();
    }
    
    async delete(id) {
        if (confirm('Delete employee?')) {
            await deleteEmployee(id);
            await this.table.refresh();
        }
    }
}

const employeeManager = new EmployeeManager(application);
```

## Quick Reference

| Feature | FormRenderV2 | TableRenderV2 |
|---------|--------------|---------------|
| **Purpose** | Create/edit forms | Display data tables |
| **Schema** | `modelPath` → form fields | `modelPath` → table columns |
| **Data** | User input | `dataPath` → table rows |
| **Customization** | Field validation, submit handlers | Custom columns with templates |
| **Templates** | Form, TextInput, SelectInput, etc. | Table, TableRow, TableCell |
| **Key Method** | `render()`, `getFormData()`, `setData()` | `render()`, `setData()`, `refresh()` |

Both classes provide consistent, template-based UI generation with minimal configuration! 🎉