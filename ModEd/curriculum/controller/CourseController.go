package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)

type CourseController struct {
	application *core.ModEdApplication
	handler     *handler.CourseHandler
}

func NewCourseController() *CourseController {
	controller := &CourseController{}
	return controller
}

func (controller *CourseController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Courses",
		Handler: controller.handler.GetCourses,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CourseController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
