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
	controller := &InternshipResultEvaluationController{
		handler: handler.NewInternshipResultEvaluationHandler(),
	}
	return controller
}

func (controller *InternshipResultEvaluationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipResultEvaluationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
