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

// GET /committees/:id
func (controller *CommitteeController) GetCommitteeByID(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil || id <= 0 {
		return ctx.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid committee ID",
		})
	}
	var committee model.Committee
	if err := controller.application.DB.First(&committee, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Committee not found",
		})
	}
	return ctx.JSON(fiber.Map{
		"success":   true,
		"committee": committee,
	})
}

// POST /project/committee
func (controller *CommitteeController) CreateCommittee(ctx *fiber.Ctx) error {
	var committee model.Committee

	// Parse JSON body into struct
	if err := ctx.BodyParser(&committee); err != nil {
		return ctx.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}
	// Insert into database
	if err := controller.application.DB.Create(&committee).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}
	return ctx.Status(201).JSON(fiber.Map{
		"success":   true,
		"committee": committee,
	})
}

// POST /project/committee/:id (Update)
func (controller *CommitteeController) UpdateCommittee(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	// Check if committee exists
	var committee model.Committee
	if err := controller.application.DB.First(&committee, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Committee not found",
		})
	}
	// Parse incoming JSON into the existing struct
	if err := ctx.BodyParser(&committee); err != nil {
		return ctx.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}
	// Save changes
	if err := controller.application.DB.Save(&committee).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}
	return ctx.JSON(fiber.Map{
		"success":   true,
		"committee": committee,
	})
}

// GET /committees/:id/delete (delete)
func (controller *CommitteeController) DeleteCommittee(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	// check if exists
	var committee model.Committee
	if err := controller.application.DB.First(&committee, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Committee not found",
		})
	}
	// delete from DB
	if err := controller.application.DB.Delete(&committee).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}
	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Committee deleted successfully",
	})
}

func (controller *CommitteeController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee",
		Handler: controller.GetCommittees,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee/:id",
		Handler: controller.GetCommitteeByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee",
		Handler: controller.CreateCommittee,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee/:id",
		Handler: controller.UpdateCommittee,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/committee/:id/delete",
		Handler: controller.DeleteCommittee,
		Method:  core.GET,
	})

	return routeList
}
