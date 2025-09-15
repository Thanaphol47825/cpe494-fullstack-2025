package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternshipReportController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipReportHandler
}

func NewInternshipReportController() *InternshipReportController {
	return &InternshipReportController{
		handler: &handler.InternshipReportHandler{},
	}
}

func (controller *InternshipReportController) GetRoute() []*core.RouteItem {
	r := []*core.RouteItem{}

	// ⚠️ static route มาก่อน เพื่อไม่ชนกับ :id
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipReport/create",
		Handler: controller.handler.RenderCreateForm,
		Method:  core.GET,
	})

	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipReport",
		Handler: controller.handler.GetAllInternshipReport,
		Method:  core.GET,
	})
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipReport",
		Handler: controller.handler.CreateInternshipReport,
		Method:  core.POST,
	})

	r = append(r, &core.RouteItem{
		Route:   "/curriculum/InternshipReport/:id",
		Handler: controller.handler.GetInternshipReportByID,
		Method:  core.GET,
	})
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipReport/:id",
		Handler: controller.handler.UpdateInternshipReportByID,
		Method:  core.POST,
	})
	r = append(r, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipReport/:id",
		Handler: controller.handler.DeleteInternshipReportByID,
		Method:  core.POST,
	})

	return r
}

func (controller *InternshipReportController) SetApplication(app *core.ModEdApplication) {
	controller.application = app
	controller.handler.DB = app.DB
	controller.handler.SetApplication(app) // ← ส่ง app เข้า handler ผ่าน setter
}
