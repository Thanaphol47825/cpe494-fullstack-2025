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
		Route:   "/curriculum/InternshipCriteria/getall",
		Handler: controller.handler.GetInternshipCriterias,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria/:id",
		Handler: controller.handler.GetInternshipCriteriaByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria/create",
		Handler: controller.handler.CreateInternshipCriteria,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria/update/:id",
		Handler: controller.handler.UpdateInternshipCriteriaByID,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipCriteria/delete/:id",
		Handler: controller.handler.DeleteInternshipCriteriaByID,
		Method:  core.GET,
	})

	return routeList
}

func (controller *InternshipCriteriaController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
