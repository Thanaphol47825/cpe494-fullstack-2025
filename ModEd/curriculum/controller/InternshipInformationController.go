package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipInformationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipInformationHandler
}

func NewInternshipInformationController(app *core.ModEdApplication) *InternshipInformationController {
	controller := &InternshipInformationController{
		application: app,
		handler:     handler.NewInternshipInformationHandler(app),
	}
	return controller
}

func (controller *InternshipInformationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/getall",
		Handler: controller.handler.GetInternshipInformations,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/:id",
		Handler: controller.handler.GetInternshipInformationByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/getByStudentID/:student_id",
		Handler: controller.handler.GetInternshipInformationByStudentID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/create",
		Handler: controller.handler.CreateInternshipInformation,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipInformation/update/:id",
		Handler: controller.handler.UpdateInternshipInformationByID,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternshipInformationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipInformationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
