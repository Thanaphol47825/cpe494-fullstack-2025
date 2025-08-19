package controller

import (
	"ModEd/core"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func (controller *DepartmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
