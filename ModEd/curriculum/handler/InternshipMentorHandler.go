package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternshipMentorHandler struct {
	DB          *gorm.DB
	application *core.ModEdApplication
}

func NewInternshipMentorHandler(app *core.ModEdApplication) *InternshipMentorHandler {
	return &InternshipMentorHandler{
		DB:          app.DB,
		application: app,
	}
}

func (controller *InternshipMentorHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipMentor")
}

func (controller *InternshipMentorHandler) GetInternshipMentor(context *fiber.Ctx) error {
	id := context.Params("id")

	var mentor model.InternshipMentor

	if id == "" {
		// No ID provided, return all mentors
		var mentors []model.InternshipMentor
		if err := controller.DB.Find(&mentors).Error; err != nil {
			return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch mentors",
			})
		}
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    mentors,
		})
	}

	// ID provided, return specific mentor
	if err := controller.DB.Preload("Company").First(&mentor, "id = ?", id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "mentor not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    mentor,
	})
}

func (controller *InternshipMentorHandler) CreateInternshipMentorRender(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "curriculum", "view", "InternshipMentor.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		// Log the error for debugging
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to parse template",
		})
	}
	rendered := template.Render(map[string]string{
		"title":   "ModEd - Internship Mentor",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InternshipMentorHandler) CreateInternshipMentor(context *fiber.Ctx) error {
	var newMentor model.InternshipMentor

	if err := context.BodyParser(&newMentor); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	if err := controller.DB.Create(&newMentor).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create mentor",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    newMentor,
	})
}

func (controller *InternshipMentorHandler) UpdateInternshipMentor(context *fiber.Ctx) error {
	var updatedMentor model.InternshipMentor

	if err := context.BodyParser(&updatedMentor); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	var existingMentor model.InternshipMentor
	if err := controller.DB.First(&existingMentor, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	existingMentor = updatedMentor
	if err := controller.DB.Save(&existingMentor).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update mentor",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existingMentor,
	})

}

func (controller *InternshipMentorHandler) DeleteInternshipMentor(context *fiber.Ctx) error {
	if err := controller.DB.Delete(&model.InternshipMentor{}, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete mentor",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "mentor deleted successfully",
	})
}
