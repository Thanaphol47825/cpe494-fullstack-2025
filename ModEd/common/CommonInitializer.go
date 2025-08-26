package common

import (
	"ModEd/common/controller"
	"ModEd/common/model"
	"ModEd/core"
)

func InitialCommon() {
	application := core.GetApplication()
	
	// Drop all table
	// application.DB.Migrator().DropTable(&model.Student{}, &model.RegularStudent{}, &model.InternationalStudent{}, &model.Instructor{}, &model.Department{}, &model.Faculty{})
	
	// GORM auto migrate feature
	application.DB.AutoMigrate(
		&model.Faculty{},
		&model.Department{},
		&model.Student{},
		&model.RegularStudent{},
		&model.InternationalStudent{},
		&model.Instructor{},
	)
	
	application.AddController(controller.NewInstructorController())
	application.AddController(controller.NewStudentController())
	application.AddController(controller.NewDepartmentController())
	application.AddController(controller.NewFacultyController())
}
