package main

import (
	"ModEd/common"
	"ModEd/core"
<<<<<<< HEAD
	"ModEd/curriculum"
=======
	"ModEd/hr"
	"ModEd/project"
>>>>>>> 727e7a626f60995936e19c6730ff325d95e3f972
)

func main() {
	application := core.GetApplication()
	common.InitialCommon()
	curriculum.InitialCurriculum()
	application.Run()
}
