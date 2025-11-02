package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
	"ModEd/curriculum/model"
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
		Route:   "/curriculum/company/getAll",
		Handler: controller.handler.GetAllCompany,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/company/create",
		Handler: controller.handler.CreateCompany,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/company/get/:id",
		Handler: controller.handler.GetCompanyByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/company/update/:id",
		Handler: controller.handler.UpdateCompanyByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/company/delete/:id",
		Handler: controller.handler.DeleteCompanyByID,
		Method:  core.POST,
	})
	return routeList
}

// func (controller *CompanyController) GetModelMeta() []*core.ModelMeta {
// 	modelMetaList := []*core.ModelMeta{}
// 	return modelMetaList
// }

func (controller *CompanyController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{
		{
			Path:  "curriculum/company",
			Model: &model.Company{},
		},
	}
	return modelMetaList
}

func (controller *CompanyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
