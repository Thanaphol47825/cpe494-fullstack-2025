package project

import (
    "ModEd/project/controller"
    "ModEd/core"
)

func InitialProject() {
    application := core.GetApplication()
    application.AddController(controller.NewSeniorProjectController())
}
