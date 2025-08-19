package controller

import (
	"ModEd/core"
)

type ClassController struct {
	application *core.ModEdApplication
}

func (controller *ClassController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
