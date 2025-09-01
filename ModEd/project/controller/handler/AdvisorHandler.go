package handler

import (
	"ModEd/project/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AdvisorHandler struct {
	DB *gorm.DB
}

func NewAdvisorHandler() *AdvisorHandler {
	return &AdvisorHandler{}
}

func (h *AdvisorHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello project/Advisor")
}

func (h *AdvisorHandler) CreateAdvisor(context *fiber.Ctx) error {
	var payload *model.Advisor
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Advisor created successfully",
	})
}

func (h *AdvisorHandler) GetAdvisorByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var advisor model.Advisor
	if err := h.DB.First(&advisor, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    advisor,
	})
}

func (h *AdvisorHandler) GetAdvisors(context *fiber.Ctx) error {
	var advisors []model.Advisor
	if err := h.DB.Find(&advisors).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    advisors,
	})
}

func (h *AdvisorHandler) UpdateAdvisor(context *fiber.Ctx) error {
	var payload *model.Advisor
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if payload.ID == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "missing ID in payload",
		})
	}

	if err := h.DB.Save(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to update advisor",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Advisor updated successfully",
	})
}

func (h *AdvisorHandler) DeleteAdvisor(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.Advisor{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete advisor",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Advisor deleted successfully",
	})
}
