package project

import (
	"ModEd/core"
	"ModEd/project/controller"
)

func InitialProject() {
	application := core.GetApplication()
	application.AddController(controller.NewSeniorProjectController())
}
