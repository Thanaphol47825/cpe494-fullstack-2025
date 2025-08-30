package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type CompanyController struct {
	application *core.ModEdApplication
	handler     *handler.CompanyHandler
}

func NewCompanyController(app *core.ModEdApplication) *CompanyController {
	controller := &CompanyController{
		application: app,
		handler:     &handler.CompanyHandler{DB: app.DB},
	}
	return controller
}

func (controller *CompanyController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Company",
		Handler: controller.handler.GetCompany,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/createCompany",
		Handler: controller.handler.CreateCompany,
		Method:  core.POST,
	})
	return routeList
}

func (controller *CompanyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
