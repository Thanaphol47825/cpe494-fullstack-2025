package common

import (
	"ModEd/common/controller"
	"ModEd/core"
)

func InitialCommon() {
	application := core.GetApplication()
	application.AddController(controller.NewBackOfficeController())
}
