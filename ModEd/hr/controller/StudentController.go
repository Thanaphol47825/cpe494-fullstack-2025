package controller

import (
	"ModEd/core"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (controller *StudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
