package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipCriteriaController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipCriteriaHandler
}

func NewInternshipCriteriaController() *InternshipCriteriaController {
	controller := &InternshipCriteriaController{
		handler: handler.NewInternshipCriteriaHandler(),
	}
	return controller
}

func (controller *InternshipCriteriaController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria/GetInternshipCriterias",
		Handler: controller.handler.GetInternshipCriterias,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipCriteriaController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
