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
		Route:   "/curriculum/SupervisorReview/GetAllSupervisorReviews",
		Handler: controller.handler.GetSupervisorReviews,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview/:id",
		Handler: controller.handler.GetSupervisorReviewByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview/create",
		Handler: controller.handler.CreateSupervisorReview,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview/update/:id",
		Handler: controller.handler.UpdateSupervisorReviewByID,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/SupervisorReview/delete/:id",
		Handler: controller.handler.DeleteSupervisorReviewByID,
		Method:  core.GET,
	})
	return routeList
}

func (controller *SupervisorReviewController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
