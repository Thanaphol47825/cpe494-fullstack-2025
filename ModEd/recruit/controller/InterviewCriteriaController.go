package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InterviewCriteriaController struct {
	application *core.ModEdApplication
}

func NewInterviewCriteriaController() *InterviewCriteriaController {
	controller := &InterviewCriteriaController{}
	return controller
}

func (controller *InterviewCriteriaController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello recruit/InterviewCriteria")
}

func (controller *InterviewCriteriaController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/InterviewCriteria",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InterviewCriteriaController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
