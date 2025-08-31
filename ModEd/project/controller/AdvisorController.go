package controller

import (
	"ModEd/core"
	"ModEd/project/model"

	"github.com/gofiber/fiber/v2"
)

type AdvisorController struct {
	application *core.ModEdApplication
}

func (controller *AdvisorController) GetAllAdvisorsHandler(c *fiber.Ctx) error {
	var advisors []*model.Advisor
	result := controller.application.DB.Find(&advisors)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return c.JSON(advisors)
}

func (controller *AdvisorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/advisors",
		Handler: controller.GetAllAdvisorsHandler,
		Method:  core.GET,
	})
	return routeList
}

func NewAdvisorController() *AdvisorController {
	return &AdvisorController{}
}

func (controller *AdvisorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
