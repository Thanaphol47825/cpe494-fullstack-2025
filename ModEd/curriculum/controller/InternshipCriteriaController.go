package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipCriteriaController struct {
	application *core.ModEdApplication
}

func NewInternshipCriteriaController() *InternshipCriteriaController {
	controller := &InternshipCriteriaController{}
	return controller
}

func (controller *InternshipCriteriaController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipCriteria")
}
func (controller *InternshipCriteriaController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipCriteriaController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
