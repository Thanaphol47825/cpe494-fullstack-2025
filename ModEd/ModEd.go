package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/hr"
	"ModEd/project"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	project.InitialProject()
	hr.InitialCommon()
	application.Run()
}
