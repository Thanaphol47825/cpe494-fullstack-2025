package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type ApplicantController struct {
	application *core.ModEdApplication
}

func NewApplicantController() *ApplicantController {
	controller := &ApplicantController{}
	return controller
}

func (controller *ApplicantController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Recruit Applicant")
}

func (controller *ApplicantController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/Applicant",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
func (controller *ApplicantController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}