package main

import (
	"ModEd/common"
	"ModEd/core"
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	application.Run()
}
