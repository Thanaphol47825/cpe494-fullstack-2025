package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"
)

type InternStudentSkillController struct {
	app     *core.ModEdApplication
	handler *handler.InternStudentSkillHandler
}

func NewInternStudentSkillController(app *core.ModEdApplication) *InternStudentSkillController {
	return &InternStudentSkillController{
		app:     app,
		handler: &handler.InternStudentSkillHandler{DB: app.DB},
	}
}

func (c *InternStudentSkillController) GetRoute() []*core.RouteItem {
	routes := []*core.RouteItem{
		
		{
			Route:   "/curriculum/InternStudentSkill/:id?",
			Handler: c.handler.GetInternStudentSkill,
			Method:  core.GET,
		},
		{
			Route:   "/curriculum/CreateInternStudentSkill",
			Handler: c.handler.CreateInternStudentSkill,
			Method:  core.POST,
		},
		{
			Route:   "/curriculum/UpdateInternStudentSkill/:id",
			Handler: c.handler.UpdateInternStudentSkill,
			Method:  core.POST,
		},
		{
			Route:   "/curriculum/DeleteInternStudentSkill/:id",
			Handler: c.handler.DeleteInternStudentSkill,
			Method:  core.POST,
		},
		{
		Route:   "/curriculum/internSkill/getByStudentID/:studentID",
		Handler: c.handler.GetInternStudentSkillByStudentID,
		Method:  core.GET,
		},

	}
	return routes
}

func (c *InternStudentSkillController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{}
}

func (c *InternStudentSkillController) SetApplication(app *core.ModEdApplication) {
	c.app = app
}
