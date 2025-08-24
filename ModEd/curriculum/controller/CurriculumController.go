package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)

type CurriculumController struct {
	application *core.ModEdApplication
	handler     handler.CurriculumHandler
}

func NewCurriculumController() *CurriculumController {
	controller := &CurriculumController{}
	return controller
}

func (controller *CurriculumController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculum",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculums",
		Handler: controller.handler.GetCurriculums,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CurriculumController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
