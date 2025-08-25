package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipApplicationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipApplicationHandler
}

func NewInternshipApplicationController() *InternshipApplicationController {
	controller := &InternshipApplicationController{}
	return controller
}

func (controller *InternshipApplicationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipApplication",
		Handler: controller.handler.GetInternshipApplication,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipApplicationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
