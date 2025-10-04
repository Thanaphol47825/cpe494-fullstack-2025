package authorization

import (
	"ModEd/authorization/controller"
	"ModEd/core"
)

func InitialAuthorization() {
	application := core.GetApplication()

	application.AddController(controller.NewAuthorizationController())
}
