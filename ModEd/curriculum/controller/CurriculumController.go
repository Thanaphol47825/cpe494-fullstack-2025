package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)

type CurriculumController struct {
	application *core.ModEdApplication
	handler     *handler.CurriculumHandler
}

func NewCurriculumController() *CurriculumController {
	controller := &CurriculumController{
		handler: handler.NewCurriculumHandler(),
	}
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
		Route:   "/curriculum/Curriculum/postCurriculum",
		Handler: controller.handler.CreateCurriculum,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculum/updateCurriculum",
		Handler: controller.handler.UpdateCurriculum,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculum/deleteCurriculum/:id",
		Handler: controller.handler.DeleteCurriculum,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculum/getCurriculums",
		Handler: controller.handler.GetCurriculums,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Curriculum/getCurriculum/:id",
		Handler: controller.handler.GetCurriculum,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CurriculumController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
