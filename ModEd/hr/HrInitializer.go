package hr

import (
	"ModEd/core"
	"ModEd/hr/controller"
)

func InitialCommon() {
	application := core.GetApplication()
	application.AddController(controller.NewStudentController())
	application.AddController(controller.NewInstructorController())
	application.AddController(controller.NewLeaveStudentHRController())
	application.AddController(controller.NewLeaveInstructorHRController())
	// application.AddController(controller.NewDepartmentController())
}
