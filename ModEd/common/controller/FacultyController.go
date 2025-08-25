package controller

import (
	"ModEd/common/model"
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type FacultyController struct {
	application *core.ModEdApplication
}

func (controller *FacultyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func NewFacultyController() *FacultyController {
	controller := &FacultyController{}
	return controller
}

func (controller *FacultyController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Faculty",
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

func (controller *FacultyController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Faculty")
}

func (controller *FacultyController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var faculties []*model.Faculty
	result := controller.application.DB.Find(&faculties)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validFaculties := []*model.Faculty{}
	for _, d := range faculties {
		if err := d.Validate(); err == nil {
			validFaculties = append(validFaculties, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validFaculties,
	})
}
