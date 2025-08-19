package curriculum

import (
	"ModEd/core"
	"ModEd/curriculum/controller"
)

func InitialCurriculum() {
	application := core.GetApplication()
	application.AddController(controller.NewInternshipApplicationController())
}
