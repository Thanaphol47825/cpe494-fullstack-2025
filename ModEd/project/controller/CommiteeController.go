package controller

import (
	"ModEd/core"
	"ModEd/project/model"

	"github.com/gofiber/fiber/v2"
)

type CommitteeController struct {
	application *core.ModEdApplication
}

func NewCommitteeController() *CommitteeController {
	return &CommitteeController{}
}

func (controller *CommitteeController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("hello committee")
}

// GET /committees
func (controller *CommitteeController) GetCommittees(ctx *fiber.Ctx) error {
	var committees []model.Committee

	if err := controller.application.DB.
		Find(&committees).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return ctx.JSON(fiber.Map{
		"success":    true,
		"committees": committees,
	})
}

func (controller *CommitteeController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee",
		Handler: controller.GetCommittees,
		Method:  core.GET,
	})
	return routeList
}
