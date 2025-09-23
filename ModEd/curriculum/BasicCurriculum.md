## Weekly Progress 

### Curriculum Module (Basic Curriculum)

#### 26/08/2025

- Reviewed and updated basic curriculum controllers:
	- `ClassController.go`
	- `ClassMaterialController.go`
	- `CourseController.go`
	- `CoursePlanController.go`
	- `CurriculumController.go`
- Reviewed and updated basic curriculum-related model:
	- `Class.go`
	- `ClassMaterial.go`
	- `Course.go`
	- `CoursePlan.go`
	- `Curriculum.go`
- Add handler:
	- Class, Class Material, Course, CoursePlan and Curriculum (`handler/`)
- Add Mock data files:
	- `class.json`, `classMaterial.json`, `course.json`, `coursePlan.json`, `curriculum.json`
- Add curriculum utilities in `utils/mapper.go`
- Migrate Model into db

#### 02/09/2025

- Update Model Relation
- Implement CRUD in controller and handler

- TODO : Each member should create a view file of their own model. The view file must contain form which is user use to insert and create a new record.

#### 23/09/2025
**Refactor & Feature Update: Curriculum Module**

- Refactored `CurriculumApplication.js`:
	- Converted logic to **class structure**
	- Introduced a `render` method to centralize UI rendering & event handling

- **Implemented** the `CurriculumApplication` class:
	- Can be instantiated and executed via the `render` method
	- Allows users to interact with the interface directly

- **New Features:**
	- Interactive button creation
	- Dynamic module loading
	- Seamless execution of curriculum actions:
		- Create classes
		- Create materials
		- Create course plans
	- Integrated with supporting scripts:
		- `CurriculumCreate.js`
		- `ClassCreate.js`
		- `CoursePlanCreate.js`
		- `ClassMaterialCreate.js`
		- `CourseCreate.js`