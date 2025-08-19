package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/hr"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	project.InitialProject()
	hr.InitialCommon()
	application.Run()
}
