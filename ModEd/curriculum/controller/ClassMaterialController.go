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
		Route:  "/curriculum/ClassMaterial/createClassMaterial",
		Handler: controller.handler.CreateClassMaterial,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:  "/curriculum/ClassMaterial/getClassMaterial/:id",
		Handler: controller.handler.GetClassMaterialById,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/ClassMaterial/getClassMaterials",
		Handler: controller.handler.GetClassMaterials,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:  "/curriculum/ClassMaterial/updateClassMaterial/",
		Handler: controller.handler.UpdateClassMaterial,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:  "/curriculum/ClassMaterial/deleteClassMaterial/:id",
		Handler: controller.handler.DeleteClassMaterial,
		Method:  core.GET,
	})

	return routeList
}

func (controller *ClassMaterialController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.DB = application.DB
}
