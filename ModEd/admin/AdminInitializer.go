package admin

import (
	"ModEd/admin/controller"
	"ModEd/core"
)

func InitialAdmin() {
	application := core.GetApplication()

	application.AddController(controller.NewAuthorizationController())
}
