package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipReportController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipReportHandler
}

func NewInternshipReportController() *InternshipReportController {
	controller := &InternshipReportController{
		handler: handler.NewInternshipReportHandler(),
	}
	return controller
}

func (controller *InternshipReportController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipReport",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipReportController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
