package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/hr"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	hr.InitialCommon()
	application.Run()
}
