package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type CompanyController struct {
	application *core.ModEdApplication
	handler     *handler.CompanyHandler
}

func NewCompanyController() *CompanyController {
	controller := &CompanyController{}
	return controller
}

func (controller *CompanyController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Company",
		Handler: controller.handler.GetCompany,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CompanyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
