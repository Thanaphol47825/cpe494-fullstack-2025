package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
	"ModEd/curriculum/model"
)

type InternshipRegistrationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipRegistrationHandler
}

func NewInternshipRegistrationController(app *core.ModEdApplication) *InternshipRegistrationController {
	controller := &InternshipRegistrationController{
		application: app,
		handler:     handler.NewInternshipRegistrationHandler(app.DB, app),
	}
	return controller
}

func (controller *InternshipRegistrationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internshipRegistration/getAll",
		Handler: controller.handler.GetInternshipRegistration,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internshipRegistration/create",
		Handler: controller.handler.CreateInternshipRegistration,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internshipRegistration/get/:id",
		Handler: controller.handler.GetInternshipRegistrationById,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internshipRegistration/update/:id",
		Handler: controller.handler.UpdateInternshipRegistrationById,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internshipRegistration/delete/:id",
		Handler: controller.handler.DeleteInternshipRegistrationById,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternshipRegistrationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{
		{
			Path:  "curriculum/internshipRegistration",
			Model: &model.InternshipRegistration{},
		},
	}
	return modelMetaList
}

func (controller *InternshipRegistrationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	// controller.handler = handler.NewInternshipRegistrationHandler(application.DB, application)
}
