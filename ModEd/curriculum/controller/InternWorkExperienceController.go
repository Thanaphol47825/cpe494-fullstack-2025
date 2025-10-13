package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternWorkExperienceController struct {
	application *core.ModEdApplication
	handler     *handler.InternWorkExperienceHandler
}

func NewInternWorkExperienceController(app *core.ModEdApplication) *InternWorkExperienceController {
	controller := &InternWorkExperienceController{
		application: app,
		handler:     handler.NewInternWorkExperienceHandler(app.DB, app),
	}
	return controller
}

func (controller *InternWorkExperienceController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/getAll",
		Handler: controller.handler.GetAllInternWorkExperience,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/create",
		Handler: controller.handler.CreateInternWorkExperience,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/get/:id",
		Handler: controller.handler.GetInternWorkExperienceByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/update/:id",
		Handler: controller.handler.UpdateInternWorkExperienceByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/delete/:id",
		Handler: controller.handler.DeleteInternWorkExperienceByID,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/internWorkExperience/getByStudentID/:student_id",
		Handler: controller.handler.GetInternWorkExperienceByStudentID,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternWorkExperienceController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternWorkExperienceController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
