package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type CourseController struct {
	application *core.ModEdApplication
}

func (controller *CourseController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Course")
}
func (controller *CourseController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CourseController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}