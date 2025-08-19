package controller

import (
	"ModEd/core"
)

type EvalController struct {
	application *core.ModEdApplication
}

func (controller *EvalController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
func (controller *EvalController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/eval",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
