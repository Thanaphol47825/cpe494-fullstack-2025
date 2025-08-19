package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type CoursePlanController struct {
	application *core.ModEdApplication
}

func (controller *CoursePlanController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/CoursePlan")
}

func (controller *CoursePlanController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CoursePlanController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
