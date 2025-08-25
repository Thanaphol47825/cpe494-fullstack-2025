package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

)

type SupervisorReviewController struct {
	application *core.ModEdApplication
	handler     *handler.SupervisorReviewHandler
}

func NewSupervisorReviewController() *SupervisorReviewController {
	controller := &SupervisorReviewController{
		handler: handler.NewSupervisorReviewHandler(),
	}
	return controller
}

func (controller *SupervisorReviewController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview/GetSupervisorReviews",
		Handler: controller.handler.GetSupervisorReviews,
		Method:  core.GET,
	})
	return routeList
}

func (controller *SupervisorReviewController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
