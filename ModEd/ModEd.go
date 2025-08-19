package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/curriculum"
	"ModEd/hr"
	"ModEd/project"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	curriculum.InitialCurriculum()
	project.InitialProject()
	hr.InitialCommon()
	application.Run()
}
