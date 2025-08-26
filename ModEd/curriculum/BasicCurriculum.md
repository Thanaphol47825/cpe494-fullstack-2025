## Weekly Progress 

### 26/08/2025

#### Curriculum Module (Basic Curriculum)

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
	- `CourseStatus.go`
	- `Curriculum.go`
- Add handler:
	- Class, Class Material, Course, CoursePlan and Curriculum (`handler/`)
- Add Mock data files:
	- `class.json`, `classMaterial.json`, `course.json`, `coursePlan.json`, `curriculum.json`
- Add curriculum utilities in `utils/mapper.go`
- Migrate Model into db