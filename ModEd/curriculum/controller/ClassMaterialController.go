package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type ClassMaterialControllerInterface struct {
	application *core.ModEdApplication
}

func (controller *ClassMaterialControllerInterface) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Class Material Main Page")
}

func (controller *ClassMaterialControllerInterface) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/ClassMaterial",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ClassMaterialControllerInterface) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
