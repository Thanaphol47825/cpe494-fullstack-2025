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
		Route:   "/curriculum/Class/createClass",
		Handler: controller.handler.CreateClass,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class/getClass/:id",
		Handler: controller.handler.GetClassById,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class/getClasses",
		Handler: controller.handler.GetClasses,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class/updateClass",
		Handler: controller.handler.UpdateClass,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class/deleteClass/:id",
		Handler: controller.handler.DeleteClass,
		Method:  core.GET,
	})

	return routeList
}

func (controller *ClassController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
