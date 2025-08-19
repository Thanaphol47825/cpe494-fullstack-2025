package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type ClassMaterialController struct {
	application *core.ModEdApplication
}

func (controller *ClassMaterialController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Class Material Main Page")
}

func (controller *ClassMaterialController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/ClassMaterial",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ClassMaterialController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
