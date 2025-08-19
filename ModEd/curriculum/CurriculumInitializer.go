package curriculum

import (
	"ModEd/core"
	"ModEd/curriculum/controller"
)

func InitialCurriculum() {
	application := core.GetApplication()
<<<<<<< HEAD
	application.AddController(controller.NewInternshipApplicationController())
=======
	application.AddController(controller.NewClassController())
	application.AddController(controller.NewClassMaterialController())
	application.AddController(controller.NewCoursePlanController())
	application.AddController(controller.NewCurriculumController())
>>>>>>> 7ba461f7d4f38a4cefc54856ef2220cc3196e335
}
