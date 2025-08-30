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
		Route:   "/curriculum/getAllCompany",
		Handler: controller.handler.GetAllCompany,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/createCompany",
		Handler: controller.handler.CreateCompany,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/getCompany/:id",
		Handler: controller.handler.GetCompanyByID,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CompanyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
