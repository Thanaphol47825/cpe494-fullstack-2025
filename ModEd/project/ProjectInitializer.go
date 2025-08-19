package project

import (
	"ModEd/project/controller"
	"ModEd/core"

)

func InitialCommon() {
	application := core.GetApplication()
	application.AddController(controller.SeniorProjectController())
}