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
	controller := &CourseController{
		handler: handler.NewCourseHandler(),
	}
	return controller
}

func (controller *CourseController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course",
		Handler: controller.handler.RenderCreateForm,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course/getCourses",
		Handler: controller.handler.GetCourses,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course/getCourses/:id",
		Handler: controller.handler.GetCourseById,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course/createCourse",
		Handler: controller.handler.CreateCourse,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course/updateCourse/:id",
		Handler: controller.handler.UpdateCourse,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Course/deleteCourse/:id",
		Handler: controller.handler.DeleteCourse,
		Method:  core.GET,
	})

	return routeList
}

func (controller *CourseController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
