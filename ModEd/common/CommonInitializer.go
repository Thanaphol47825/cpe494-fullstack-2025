package common

import (
	"ModEd/common/controller"
	"ModEd/core"
)

func InitialCommon() {
	application := core.GetApplication()
	application.AddController(controller.NewInstructorController())
	application.AddController(controller.NewStudentController())
	application.AddController(controller.NewDepartmentController())
	application.AddController(controller.NewFacultyController())
	application.AddController(controller.NewBackOfficeController())
	application.AddController(controller.NewAuthorizationController())
}
