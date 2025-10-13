package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternProjectController struct {
	application *core.ModEdApplication
	handler     *handler.InternProjectHandler
}

func NewInternProjectController(app *core.ModEdApplication) *InternProjectController {
	controller := &InternProjectController{
		application: app,
		handler:     handler.NewInternProjectHandler(app.DB, app),
	}
	return controller
}

func (controller *InternProjectController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internProject/getAll",
		Handler: controller.handler.GetAllInternProject,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internProject/create",
		Handler: controller.handler.CreateInternProject,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internProject/get/:id",
		Handler: controller.handler.GetInternProjectByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internProject/update/:id",
		Handler: controller.handler.UpdateInternProjectByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internProject/delete/:id",
		Handler: controller.handler.DeleteInternProjectByID,
		Method:  core.POST,
	})

	return routeList
}

func (controller *InternProjectController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternProjectController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
