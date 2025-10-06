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
		handler:     handler.NewCompanyHandler(app.DB, app),
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
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/updateCompany/:id",
		Handler: controller.handler.UpdateCompanyByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/deleteCompany/:id",
		Handler: controller.handler.DeleteCompanyByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/company/create",
		Handler: controller.handler.RenderCreateCompany,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CompanyController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *CompanyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
