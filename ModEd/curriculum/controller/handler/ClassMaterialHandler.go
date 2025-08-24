package handler

import "github.com/gofiber/fiber/v2"

type ClassMaterialHandler struct{}

func NewClassMaterialHandler() *ClassMaterialHandler {
	return &ClassMaterialHandler{}
}

func (h *ClassMaterialHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Class Material Main Page")
}
