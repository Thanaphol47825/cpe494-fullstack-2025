package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternStudentController struct {
	application *core.ModEdApplication
	handler     *handler.InternStudentHandler
}

func NewInternStudentController(app *core.ModEdApplication) *InternStudentController {
	controller := &InternStudentController{
		application: app,
		handler:     &handler.InternStudentHandler{DB: app.DB},
	}
	return controller
}

func (controller *InternStudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternStudent",
		Handler: controller.handler.GetInternStudent,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternStudent",
		Handler: controller.handler.CreateInternStudent,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternStudent/:id",
		Handler: controller.handler.UpdateInternStudent,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternStudent/:id",
		Handler: controller.handler.DeleteInternStudent,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternStudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
