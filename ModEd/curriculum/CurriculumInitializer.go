package curriculum

import (
	"ModEd/core"
	"ModEd/curriculum/controller"
)

func InitialCurriculum() {
	application := core.GetApplication()
	application.AddController(controller.NewClassController())
	application.AddController(controller.NewClassMaterialController())
	application.AddController(controller.NewCoursePlanController())
	application.AddController(controller.NewCurriculumController())
	application.AddController(controller.NewCourseController())

	// Student Internship
	application.AddController(controller.NewInternshipCriteriaController())
}
