package controller

import (
	"ModEd/common/model"
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func NewDepartmentController() *DepartmentController {
	controller := &DepartmentController{}
	return controller
}

func (controller *DepartmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *DepartmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Department",
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

func (controller *DepartmentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Department")
}

func (controller *DepartmentController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var departments []*model.Department
	result := controller.application.DB.Find(&departments)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validDepartments := []*model.Department{}
	for _, d := range departments {
		if err := d.Validate(); err == nil {
			validDepartments = append(validDepartments, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validDepartments,
	})
}
