package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
	"ModEd/curriculum/model"
)

type SkillController struct {
	application *core.ModEdApplication
	handler     *handler.SkillHandler
}

func NewSkillController() *SkillController {
	controller := &SkillController{
		handler: handler.NewSkillHandler(),
	}
	return controller
}

func (controller *SkillController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill",
		Handler: controller.handler.RenderCreateForm,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/createSkill",
		Handler: controller.handler.CreateSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/updateSkill/:id",
		Handler: controller.handler.UpdateSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/deleteSkill/:id",
		Handler: controller.handler.DeleteSkill,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/getSkills",
		Handler: controller.handler.GetSkills,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/getSkills/:id",
		Handler: controller.handler.GetSkill,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Skill/getSkillOptions",
		Handler: controller.handler.GetSkillOptions,
		Method:  core.GET,
	})
	return routeList
}

func (controller *SkillController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "curriculum/skill",
		Model: model.Skill{},
	})
	return modelMetaList
}

func (controller *SkillController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
