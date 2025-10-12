package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
	"ModEd/curriculum/model"
)

type CoursePlanController struct {
	application *core.ModEdApplication
	handler     *handler.CoursePlanHandler
}

func NewCoursePlanController() *CoursePlanController {
	controller := &CoursePlanController{
		handler: handler.NewCoursePlanHandler()}
	return controller
}

func (controller *CoursePlanController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan",
		Handler: controller.handler.RenderCreateCoursePlan,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/getCoursePlans",
		Handler: controller.handler.GetCoursePlans,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/getCoursePlan/:id",
		Handler: controller.handler.GetCoursePlanById,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/createCoursePlan",
		Handler: controller.handler.CreateCoursePlan,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/updateCoursePlan",
		Handler: controller.handler.UpdateCoursePlan,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CoursePlan/deleteCoursePlan/:id",
		Handler: controller.handler.DeleteCoursePlan,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CoursePlanController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "curriculum/courseplan",
		Model: model.CoursePlan{},
	})
	return modelMetaList
}

func (controller *CoursePlanController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
