package eval

import {
	"ModEd/core",
	"ModEd/eval"

}

func InitialEval() {
	application := core.GetApplication()
	application.AddController(&eval.Controller.EvalController{})
}
