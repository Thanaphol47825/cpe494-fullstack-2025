package controller

import (
	"ModEd/core"
	// "github.com/gofiber/fiber/v2"
	// "github.com/hoisie/mustache"
)

type CurriculumController struct {
	application *core.ModEdApplication
}

func (controller *CurriculumController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
