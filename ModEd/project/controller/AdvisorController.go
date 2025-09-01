package controller

import (
	"ModEd/core"
	"ModEd/project/controller/handler"
)

type AdvisorController struct {
	application *core.ModEdApplication
	handler     *handler.AdvisorHandler
}

func NewAdvisorController() *AdvisorController {
	return &AdvisorController{
		handler: handler.NewAdvisorHandler(),
	}
}

func (controller *AdvisorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/advisors/:id",
		Handler: controller.handler.GetAdvisorByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/advisors/update",
		Handler: controller.handler.UpdateAdvisor,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/advisors/delete/:id",
		Handler: controller.handler.DeleteAdvisor,
		Method:  core.GET,
	})

	return routeList
}

func (controller *AdvisorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
