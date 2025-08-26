package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)

type ClassController struct {
	application *core.ModEdApplication
	handler     *handler.ClassHandler
}

func NewClassController() *ClassController {
	return &ClassController{
		handler: handler.NewClassHandler(),
	}
}

func (controller *ClassController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class/getClasses",
		Handler: controller.handler.GetClasses,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ClassController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
