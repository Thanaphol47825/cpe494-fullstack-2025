# Model Meta and Dynamic Form Generation Guide

**Backend**: Implement `GetModelMeta()` in controllers to return `[]*core.ModelMeta` with Path and Model. Framework automatically creates `/api/modelmeta/{path}` endpoints.

**Frontend**: Fetch JSON metadata from API, transform to schema, use `FormRender` class to generate dynamic forms.

**Process**: `AddController()` → calls `GetModelMeta()` → registers API endpoints → serves form metadata as JSON.

---
## Overview
>>>>>>> 478467f (feat: ModelMeta Form API)

The ModEd framework provides a powerful system for automatically generating forms and tables from Go struct models. This system uses reflection to analyze struct fields and their tags to create dynamic UI components.

## How Model Meta Works

### 1. Core Components

#### `ModelMeta` Struct
```go
type ModelMeta struct {
    Path  string      // API endpoint path (e.g., "student", "instructor")
    Model interface{} // The Go struct model
}
```

#### `FieldMeta` Struct
Will have more in future.
```go
type FieldMeta struct {
    Name  string `json:"name"`  // Field name (from json tag or field name)
    Type  string `json:"type"`  // Input type (text, number, checkbox, etc.)
    Label string `json:"label"` // Display label (from label tag or name)
}
```

### 2. Struct Tags for Form Generation

Use these tags in your Go struct to control form generation:

```go
type Student struct {
    ID          uint      `json:"id" form:"-" label:"Student ID"`                    // Hidden field
    StudentCode string    `json:"student_code" form:"text" label:"Student Code"`     // Text input
    FirstName   string    `json:"first_name" form:"text" label:"First Name"`         // Text input
    LastName    string    `json:"last_name" form:"text" label:"Last Name"`           // Text input
    Email       string    `json:"email" form:"email" label:"Email Address"`          // Email input
    Age         int       `json:"age" form:"number" label:"Age"`                     // Number input
    IsActive    bool      `json:"is_active" form:"checkbox" label:"Active Status"`   // Checkbox
    StartDate   time.Time `json:"start_date" form:"date" label:"Start Date"`         // Date input
    Gender      string    `json:"gender" form:"select" label:"Gender"`               // Select dropdown
}
```

#### Available Form Types:
- `text` - Text input field
- `email` - Email input field  
- `password` - Password input field
- `number` - Number input field
- `date` - Date picker
- `datetime-local` - Date and time picker
- `checkbox` - Checkbox input
- `select` - Dropdown select
- `textarea` - Multi-line text area
- `"-"` - Skip this field (don't include in form)

### 3. Setting Up Model Meta in Controllers

#### Using GetModelMeta
```go
func (ctl *StudentController) GetModelMeta() []*core.ModelMeta {
    modelMetaList := []*core.ModelMeta{
        {
            Path:  "student",
            Model: &cmodel.Student{},
        },
        {
            Path:  "instructor", 
            Model: &cmodel.Instructor{},
        },
    }
    return modelMetaList
}
```
