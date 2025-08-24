package controller

import (
	"ModEd/core"
	"ModEd/curriculum/controller/handler"
)

type ClassMaterialController struct {
	application *core.ModEdApplication
	handler     *handler.ClassMaterialHandler
}

func NewClassMaterialController() *ClassMaterialController {
	controller := &ClassMaterialController{
		handler: handler.NewClassMaterialHandler(),
	}
	return controller
}

func (controller *ClassMaterialController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/ClassMaterial",
		Handler: controller.handler.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/ClassMaterial/getClassMaterials",
		Handler: controller.handler.GetClassMaterials,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ClassMaterialController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
