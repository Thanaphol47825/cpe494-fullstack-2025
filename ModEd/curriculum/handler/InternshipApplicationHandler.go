package handler

import (
	"github.com/gofiber/fiber/v2"
)

type InternshipApplicationHandler struct{}

func (controller *InternshipApplicationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipApplication")
}
