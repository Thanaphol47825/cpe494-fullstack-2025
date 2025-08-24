package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)
type CoursePlanController struct {
	application *core.ModEdApplication
	handler     *handler.CoursePlanHandler
}

func NewCoursePlanController() *CoursePlanController {
	controller := &CoursePlanController{
		handler: handler.NewCoursePlanHandler(),}
	return controller
}

func (controller *CoursePlanController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/getCoursePlan",
		Handler: controller.handler.GetCoursePlan,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CoursePlanController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
