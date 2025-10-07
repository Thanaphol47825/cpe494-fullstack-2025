# Model Meta and Dynamic Form Generation Guide

**Backend**: Implement `GetModelMeta()` in controllers to return `[]*core.ModelMeta` with Path and Model. Framework automatically creates `/api/modelmeta/{path}` endpoints.

**Frontend**: Fetch JSON metadata from API, transform to schema, use `FormRender` class to generate dynamic forms.

**Process**: `AddController()` → calls `GetModelMeta()` → registers API endpoints → serves form metadata as JSON.

# 🚀 Dynamic Form Generation System - Complete Guide

**🎯 Quick Setup:**
1. Add `GetModelMeta()` to your controller returning `[]*core.ModelMeta`
2. Use enhanced form tags: `form:"label:Name;type:text;fk:Model"`
3. Framework auto-creates `/api/modelmeta/{path}` and `/api/formschema/{path}` endpoints
4. Frontend fetches JSON, renders dynamic forms with **zero configuration**

**🔧 Controller Pattern:**
```go
func (c *Controller) GetModelMeta() []*core.ModelMeta {
    return []*core.ModelMeta{{Path: "student", Model: &Student{}}}
}
```

**🎨 Enhanced Tags:**
```go
Name     string `form:"label:Full Name;placeholder:Enter name;type:text"`
Status   Status `form:"label:Status"`
Category uint   `form:"label:Category;type:select;fk:Category"`
```

**🌐 API Endpoints:**
- `/api/modelmeta/common/student` 
---

## 🎯 System Overview

The ModEd framework provides **automatic form generation** from Go structs using reflection, struct tags, and intelligent type detection. No manual form building required!

### 🏷️ Form Tag Format

**Single `form` tag with key-value pairs:**
```go
type Student struct {
    ID           uint         `json:"id" form:"-"`                                    // Hidden
    StudentCode  string       `json:"student_code" form:"label:Student Code;placeholder:Enter code;type:text;required:true"`
    Name         string       `json:"name" form:"label:Full Name;placeholder:Enter full name;type:text"`
    Email        string       `json:"email" form:"label:Email;placeholder:Enter email;type:email"`
    DepartmentID uint         `json:"department_id" form:"label:Department;type:select;fk:Department"`
    Status       StudentStatus `json:"status" form:"label:Status"`                   // Auto-detected enum!
    GPA          float64      `json:"gpa" form:"label:GPA;type:number;format:decimal"`
    BirthDate    time.Time    `json:"birth_date" form:"label:Birth Date;type:date"`
    IsActive     bool         `json:"is_active" form:"label:Active;type:checkbox"`
    Bio          string       `json:"bio" form:"label:Biography;type:textarea;placeholder:Tell us about yourself"`
}
```

### 🔧 Available Tag Options

| Key           | Description                                              | Example                          |
|---------------|----------------------------------------------------------|----------------------------------|
| `label`       | Field display label                                      | `"Full Name"`                    |
| `placeholder` | Input placeholder text                                   | `"Enter your name"`              |
| `type`        | Input type                                              | `text`, `select`, `email`, etc.  |
| `format`      | Display format for tables                               | `currency`, `datetime`, etc.     |
| `fk`          | Foreign key model name                                  | `Department`, `Category`         |
| `fklabel`     | FK display field (default: "Name")                     | `Title`, `DisplayName`           |
| `enum`        | Explicit enum name                                      | `UserRole`, `Priority`           |
| `required`    | Mark field as required                                  | `true`, `false`                  |
| `-`           | Exclude field from forms                                | `form:"-"`                       |

## 🛠️ Implementation Guide

### 1. 🎮 Controller Setup

```go
func (c *StudentController) GetModelMeta() []*core.ModelMeta {
    return []*core.ModelMeta{
        {Path: "common/student", Model: &model.Student{}},
        {Path: "common/instructor", Model: &model.Instructor{}},
        {Path: "common/department", Model: &model.Department{}},
    }
}

func (c *StudentController) SetApplication(app *core.ModEdApplication) {
    c.application = app
    // Auto-migrate tables
    app.DB.AutoMigrate(&model.Student{}, &model.Instructor{})
}
```

### 2. 🌐 Automatic API Endpoints

When `AddController()` is called, the framework automatically creates:
```
GET /api/modelmeta/common/student 
GET /api/modelmeta/common/instructor
```

### 3. 📊 API Response Examples

**Example Endpoint (`/api/formschema/student`):**
```json
[
  {
    "label": "Student Code",
    "placeholder": "Enter student code",
    "name": "student_code",
    "type": "text"
  },
  {
    "label": "Department", 
    "name": "department_id",
    "type": "select",
    "data": [
      {"label": "Computer Science", "value": 1},
      {"label": "Mathematics", "value": 2}
    ]
  },
  {
    "label": "Status",
    "name": "status", 
    "type": "select",
    "data": [
      {"label": "Active", "value": 0},
      {"label": "Graduated", "value": 1},
      {"label": "Dropped", "value": 2}
    ]
  }
]
```