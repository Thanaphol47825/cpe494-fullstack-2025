package curriculum

import (
	"ModEd/core"
	"ModEd/curriculum/controller"
)

func InitialCurriculum() {
	application := core.GetApplication()

	// Basic Curriculum
	application.AddController(controller.NewClassController())
	application.AddController(controller.NewClassMaterialController())
	application.AddController(controller.NewCoursePlanController())
	application.AddController(controller.NewCurriculumController())
	application.AddController(controller.NewCourseController())

	// Student Internship
	application.AddController(controller.NewInternshipCriteriaController())
	application.AddController(controller.NewInternshipApplicationController())
	application.AddController(controller.NewInternshipAttendanceController())
	application.AddController(controller.NewInternshipMentorController())
	application.AddController(controller.NewInternshipEvaluationController())
}
