package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"

	"github.com/gofiber/fiber/v2"
)

type InternshipMentorController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipMentorHandler
}

func NewInternshipMentorController() *InternshipMentorController {
	controller := &InternshipMentorController{}
	return controller
}
func (controller *InternshipMentorController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello InternshipMentor")
}

func (controller *InternshipMentorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipMentor",
		Handler: controller.handler.GetInternshipMentor,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipMentorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
