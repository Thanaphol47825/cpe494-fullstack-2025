package eval

import (
	"ModEd/core"
	"ModEd/eval/controller"
)

func InitialEval() {
	application := core.GetApplication()
	application.AddController(controller.NewAssignmentController())
	application.AddController(controller.NewAssignmentSubmissionController())
	application.AddController(controller.NewAssignmentProgressController())
	application.AddController(controller.NewQuizController())
	application.AddController(controller.NewQuizSubmissionController())
	application.AddController(controller.NewEvaluationController())
	application.AddController(controller.NewSubmissionController())
}
