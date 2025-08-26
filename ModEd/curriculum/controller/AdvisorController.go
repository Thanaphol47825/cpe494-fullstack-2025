package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type AdvisorController struct {
	application *core.ModEdApplication
	handler     *handler.AdvisorHandler
}

func NewAdvisorController() *AdvisorController {
	controller := &AdvisorController{}
	return controller
}

func (controller *AdvisorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/advisor",
		Handler: controller.handler.GetAdvisor,
		Method:  core.GET,
	})
	return routeList
}

func (controller *AdvisorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
