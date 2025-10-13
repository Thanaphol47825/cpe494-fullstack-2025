package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternProjectHandler struct {
	DB          *gorm.DB
	Application *core.ModEdApplication
}

func NewInternProjectHandler(db *gorm.DB, app *core.ModEdApplication) *InternProjectHandler {
	return &InternProjectHandler{
		DB:          db,
		Application: app,
	}
}

func (controller *InternProjectHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternProject")
}

func (controller *InternProjectHandler) GetAllInternProject(context *fiber.Ctx) error {
	var internProjects []model.InternProject

	if err := controller.DB.Find(&internProjects).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get intern projects",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internProjects,
	})
}

func (controller *InternProjectHandler) CreateInternProject(context *fiber.Ctx) error {
	var newInternProject model.InternProject

	if err := context.BodyParser(&newInternProject); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newInternProject).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create intern project",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    newInternProject,
	})
}

func (controller *InternProjectHandler) GetInternProjectByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var internProject model.InternProject

	if err := controller.DB.First(&internProject, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern project not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internProject,
	})
}

func (controller *InternProjectHandler) UpdateInternProjectByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var updatedInternProject model.InternProject

	if err := context.BodyParser(&updatedInternProject); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	var internProject model.InternProject
	if err := controller.DB.First(&internProject, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern project not found",
		})
	}

	internProject.StudentId = updatedInternProject.StudentId
	internProject.ProjectName = updatedInternProject.ProjectName
	internProject.ProjectDetail = updatedInternProject.ProjectDetail

	if err := controller.DB.Save(&internProject).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update intern project",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internProject,
	})
}

func (controller *InternProjectHandler) DeleteInternProjectByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var internProject model.InternProject

	if err := controller.DB.First(&internProject, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern project not found",
		})
	}

	if err := controller.DB.Delete(&internProject).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete intern project",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fmt.Sprintf("intern project with ID %s deleted", id),
	})
}
