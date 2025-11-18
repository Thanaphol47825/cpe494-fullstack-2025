package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
	"ModEd/curriculum/model"
)

type CourseSkillController struct {
	application *core.ModEdApplication
	handler     *handler.CourseSkillHandler
}

func NewCourseSkillController() *CourseSkillController {
	controller := &CourseSkillController{
		handler: handler.NewCourseSkillHandler(),
	}
	return controller
}

func (controller *CourseSkillController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill",
		Handler: controller.handler.RenderCreateForm,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/createCourseSkill",
		Handler: controller.handler.CreateCourseSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/createCourseSkills",
		Handler: controller.handler.CreateMultipleCourseSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/updateCourseSkill/:id",
		Handler: controller.handler.UpdateCourseSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/deleteCourseSkill/:id",
		Handler: controller.handler.DeleteCourseSkill,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/getCourseSkills",
		Handler: controller.handler.GetCourseSkills,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/getCourseSkill/:id",
		Handler: controller.handler.GetCourseSkill,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CourseSkill/getSkillsByCourse/:courseId",
		Handler: controller.handler.GetSkillsByCourse,
		Method:  core.GET,
	})

	return routeList
}

func (controller *CourseSkillController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "curriculum/courseskill",
		Model: model.CourseSkill{},
	})
	return modelMetaList
}

func (controller *CourseSkillController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
