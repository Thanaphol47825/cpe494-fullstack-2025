package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/curriculum"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	curriculum.InitialCurriculum()
	application.Run()
}
