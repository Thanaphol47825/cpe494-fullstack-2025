package handler

import (
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type ApprovedStatusHandler struct{}

func NewApprovedStatusHandler() *ApprovedStatusHandler {
	return &ApprovedStatusHandler{}
}

// GetApprovedStatusOptions returns all available approval status values
func (h *ApprovedStatusHandler) GetApprovedStatusOptions(context *fiber.Ctx) error {
	options := []fiber.Map{
		{
			"label": "Not Started",
			"value": string(model.INTERN_APP_NOT_START),
		},
		{
			"label": "In Progress",
			"value": string(model.INTERN_APP_IN_PROGRESS),
		},
		{
			"label": "Approved",
			"value": string(model.INTERN_APP_APPROVED),
		},
		{
			"label": "Rejected",
			"value": string(model.INTERN_APP_REJECT),
		},
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    options,
	})
}
