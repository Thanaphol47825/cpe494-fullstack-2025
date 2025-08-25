package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipAttendanceController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipAttendanceHandler
}

func NewInternshipAttendanceController() *InternshipAttendanceController {
	controller := &InternshipAttendanceController{
		handler: handler.NewInternshipAttendanceHandler(),
	}
	return controller
}

func (controller *InternshipAttendanceController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance/GetInternshipAttendances",
		Handler: controller.handler.GetInternshipAttendances,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipAttendanceController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
