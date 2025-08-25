package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipInformationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipInformationHandler
}

func NewInternshipInformationController() *InternshipInformationController {
	controller := &InternshipInformationController{
		handler: handler.NewInternshipInformationHandler(),
	}
	return controller
}

func (controller *InternshipInformationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/GetInternshipInformations",
		Handler: controller.handler.GetInternshipInformations,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipInformationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
