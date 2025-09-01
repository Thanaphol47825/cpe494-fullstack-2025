package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipResultEvaluationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipResultEvaluationHandler
}

func NewInternshipResultEvaluationController() *InternshipResultEvaluationController {
	return &InternshipResultEvaluationController{
		handler: &handler.InternshipResultEvaluationHandler{},
	}
}

func (controller *InternshipResultEvaluationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation",
		Handler: controller.handler.GetAllInternshipResultEvaluation, 
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipResultEvaluation",
		Handler: controller.handler.CreateInternshipResultEvaluation,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation/:id",
		Handler: controller.handler.GetInternshipResultEvaluationByID, 
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipResultEvaluation/:id",
		Handler: controller.handler.UpdateInternshipResultEvaluationByID, 
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipResultEvaluation/:id",
		Handler: controller.handler.DeleteInternshipResultEvaluationByID, 
		Method:  core.POST,
	})

	return routeList
}

func (controller *InternshipResultEvaluationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
