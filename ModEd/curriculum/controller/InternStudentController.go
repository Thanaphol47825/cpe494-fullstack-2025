package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternStudentController struct {
	application *core.ModEdApplication
	handler     *handler.InternStudentHandler
}

func NewInternStudentController() *InternStudentController {
	controller := &InternStudentController{}
	return controller
}

func (controller *InternStudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternStudent",
		Handler: controller.handler.GetInternStudent,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternStudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
