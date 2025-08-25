package hr

import (
	"ModEd/core"
	"ModEd/hr/controller"
)

func InitialCommon() {
	application := core.GetApplication()
	application.AddController(controller.NewStudentController())
	application.AddController(controller.NewLeaveStudentHRController())
	// application.AddController(controller.NewDepartmentController())
}
