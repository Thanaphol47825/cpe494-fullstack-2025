package controller

import (
	"ModEd/core"
	"ModEd/project/controller/handler"
)

type SeniorProjectController struct {
	application *core.ModEdApplication
	handler     *handler.SeniorProjectHandler
}

func NewSeniorProjectController() *SeniorProjectController {
	return &SeniorProjectController{
		handler: handler.NewSeniorProjectHandler(),
	}
}

func (controller *SeniorProjectController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *SeniorProjectController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject/createProject",
		Handler: controller.handler.CreateProject,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject/getProject/:id",
		Handler: controller.handler.GetProjectById,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject/getProjects",
		Handler: controller.handler.GetProjects,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject/updateProject",
		Handler: controller.handler.UpdateProject,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject/deleteProject/:id",
		Handler: controller.handler.DeleteProject,
		Method:  core.GET,
	})

	return routeList
}
