package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternCertificateHandler struct {
	DB          *gorm.DB
	application *core.ModEdApplication
}

func NewInternCertificateHandler(app *core.ModEdApplication) *InternCertificateHandler {
	return &InternCertificateHandler{
		DB:          app.DB,
		application: app,
	}
}

func (controller *InternCertificateHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternCertificate")
}

func (controller *InternCertificateHandler) GetInternCertificate(context *fiber.Ctx) error {
	id := context.Params("id")

	var certificate model.InternCertificate

	if id == "" {
		// No ID provided, return all certificates
		var certificates []model.InternCertificate
		if err := controller.DB.Find(&certificates).Error; err != nil {
			return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch certificates",
			})
		}
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    certificates,
		})
	}

	// ID provided, return specific certificate
	if err := controller.DB.Preload("Company").First(&certificate, "id = ?", id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "certificate not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    certificate,
	})
}

func (controller *InternCertificateHandler) CreateInternCertificateRender(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "curriculum", "view", "InternCertificate.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		// Log the error for debugging
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to parse template",
		})
	}
	rendered := template.Render(map[string]string{
		"title":   "ModEd - Internship Certificate",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InternCertificateHandler) CreateInternCertificate(context *fiber.Ctx) error {
	var newCertificate model.InternCertificate

	if err := context.BodyParser(&newCertificate); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to parse request body: " + err.Error(),
		})
	}

	// Validate required fields
	if newCertificate.CertificateNumber == "" {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "certificate_number is required",
		})
	}

	// Validate foreign key relationships
	if newCertificate.CertificateId != 0 {
		var certificate model.Certificate
		if err := controller.DB.First(&certificate, newCertificate.CertificateId).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "certificate not found with the provided certificate_id",
			})
		}
	}

	if newCertificate.InternStudentId != 0 {
		var student model.InternStudent
		if err := controller.DB.First(&student, newCertificate.InternStudentId).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "intern student not found with the provided intern_student_id",
			})
		}
	}

	if err := controller.DB.Create(&newCertificate).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create certificate: " + err.Error(),
		})
	}

	// Reload with relationships
	var createdCertificate model.InternCertificate
	if err := controller.DB.Preload("Certificate").Preload("InternStudent").First(&createdCertificate, newCertificate.ID).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    newCertificate,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    createdCertificate,
	})
}

func (controller *InternCertificateHandler) UpdateInternCertificate(context *fiber.Ctx) error {
	var updatedInternCertificate model.InternCertificate

	if err := context.BodyParser(&updatedInternCertificate); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	var existingInternCertificate model.InternCertificate
	if err := controller.DB.First(&existingInternCertificate, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	existingInternCertificate = updatedInternCertificate
	if err := controller.DB.Save(&existingInternCertificate).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update certificate",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existingInternCertificate,
	})

}

func (controller *InternCertificateHandler) DeleteInternCertificate(context *fiber.Ctx) error {
	if err := controller.DB.Delete(&model.InternCertificate{}, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete certificate",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "intern certificate deleted successfully",
	})
}
