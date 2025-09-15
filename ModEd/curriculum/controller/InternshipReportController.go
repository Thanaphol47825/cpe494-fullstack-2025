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
		handler: &handler.InternshipReportHandler{},
	}
	return controller
}

func (controller *InternshipReportController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipReport",
		Handler: controller.handler.GetAllInternshipReport, 
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipReport",
		Handler: controller.handler.CreateInternshipReport, 
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipReport/:id",
		Handler: controller.handler.GetInternshipReportByID, 
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipReport/:id",
		Handler: controller.handler.UpdateInternshipReportByID, 
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipReport/:id",
		Handler: controller.handler.DeleteInternshipReportByID, 
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
    Route:   "/curriculum/InternshipReport/create",
    Handler: controller.handler.RenderCreateForm,
    Method:  core.GET,
  })

	return routeList
}

func (controller *InternshipReportController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
