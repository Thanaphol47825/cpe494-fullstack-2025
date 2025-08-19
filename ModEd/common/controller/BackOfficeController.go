package controller

import (
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type BackOfficeController struct {
	application *core.ModEdApplication
}

func NewBackOfficeController() *BackOfficeController {
	controller := &BackOfficeController{}
	return controller
}

func (controller *BackOfficeController) RenderMain(context *fiber.Ctx) error {
	path := fmt.Sprintf("%s/common/view/Main.tpl", controller.application.RootPath)
	template, _ := mustache.ParseFile(path)
	rendered := template.Render(map[string]string{
		"title": "ModEd BackOffice",
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *BackOfficeController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result": []fiber.Map{
			{
				"name":    "Kittipong",
				"surname": "Piyawanno",
				"email":   "k.piyawanno@gmail.com",
			},
		},
	})
}

func (controller *BackOfficeController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/backoffice",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/info",
		Handler: controller.GetInfo,
		Method:  core.POST,
	})
	return routeList
}

func (controller *BackOfficeController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
