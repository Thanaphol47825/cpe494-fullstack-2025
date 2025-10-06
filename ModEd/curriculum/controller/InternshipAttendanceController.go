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
		Route:   "/curriculum/InternshipAttendance/getall",
		Handler: controller.handler.GetAllInternshipAttendances,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance/CreateInternshipAttendance",
		Handler: controller.handler.CreateInternshipAttendance,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance/GetInternshipAttendance/:id",
		Handler: controller.handler.GetInternshipAttendanceByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance/UpdateInternshipAttendance",
		Handler: controller.handler.UpdateInternshipAttendanceByID,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance/DeleteInternshipAttendance/:id",
		Handler: controller.handler.DeleteInternshipAttendanceByID,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipAttendanceController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipAttendanceController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
