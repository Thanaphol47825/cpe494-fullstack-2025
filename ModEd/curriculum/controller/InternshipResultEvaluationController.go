package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipResultEvaluationController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipResultEvaluationHandler
}

func NewInternshipResultEvaluationController() *InternshipResultEvaluationController {
	return &InternshipResultEvaluationController{
		handler: &handler.InternshipResultEvaluationHandler{},
	}
}

func (controller *InternshipResultEvaluationController) GetRoute() []*core.RouteItem {
	r := []*core.RouteItem{}

	// Form (static) มาก่อนเสมอ กันชน :id
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation/create",
		Handler: controller.handler.RenderCreateForm,
		Method:  core.GET,
	})

	// List
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation",
		Handler: controller.handler.GetAllInternshipResultEvaluation,
		Method:  core.GET,
	})

	// Create
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipResultEvaluation",
		Handler: controller.handler.CreateInternshipResultEvaluation,
		Method:  core.POST,
	})

	// Read / Update / Delete by id
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipResultEvaluation/:id",
		Handler: controller.handler.GetInternshipResultEvaluationByID,
		Method:  core.GET,
	})
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipResultEvaluation/:id",
		Handler: controller.handler.UpdateInternshipResultEvaluationByID,
		Method:  core.POST,
	})
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipResultEvaluation/:id",
		Handler: controller.handler.DeleteInternshipResultEvaluationByID,
		Method:  core.POST,
	})

	return r
}

func (controller *InternshipResultEvaluationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipResultEvaluationController) SetApplication(app *core.ModEdApplication) {
	controller.application = app
	controller.handler.DB = app.DB
	controller.handler.SetApplication(app) // ส่ง app ให้ handler ใช้ RootPath/RootURL
}
