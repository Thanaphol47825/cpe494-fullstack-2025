package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipMentoController struct {
	application *core.ModEdApplication
}

func (controller *InternshipMentorController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Helloo InternshipMentor")
}

func (controller *InternshipMentorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipMentor",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipMentorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
