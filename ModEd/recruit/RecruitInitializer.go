package recruit

import (
	"ModEd/core"
	"ModEd/recruit/controller"
)

func InitialRecruit() {
	application := core.GetApplication()
	application.AddController(controller.NewAdminController())
	application.AddController(controller.NewApplicantController())
	application.AddController(controller.NewApplicationStatusController())
	application.AddController(controller.NewInterviewController())
	application.AddController(controller.NewInterviewCriteriaController())
}
