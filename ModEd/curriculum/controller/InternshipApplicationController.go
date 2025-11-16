package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipRegistrationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipRegistrationHandler
}

func NewInternshipRegistrationController() *InternshipRegistrationController {
	controller := &InternshipRegistrationController{}
	return controller
}

func (controller *InternshipRegistrationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipRegistration",
		Handler: controller.handler.GetInternshipRegistration,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipRegistration",
		Handler: controller.handler.CreateInternshipRegistration,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternshipRegistrationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipRegistrationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
