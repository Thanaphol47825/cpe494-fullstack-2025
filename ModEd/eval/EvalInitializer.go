package eval

import (
	"ModEd/core",
	"ModEd/eval/controller"

)

func InitialEval() {
	application := core.GetApplication()
	application.AddController(&Controller.EvalController{})
}
