package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type CertificateHandler struct {
	DB          *gorm.DB
	application *core.ModEdApplication
}

func NewCertificateHandler(app *core.ModEdApplication) *CertificateHandler {
	return &CertificateHandler{
		DB:          app.DB,
		application: app,
	}
}

func (controller *CertificateHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Certificate")
}

func (controller *CertificateHandler) GetCertificate(context *fiber.Ctx) error {
	id := context.Params("id")

	if id == "" {
		// No ID provided, return all certificates
		var certificates []model.Certificate
		if err := controller.DB.Preload("Company").Find(&certificates).Error; err != nil {
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
	var certificate model.Certificate
	if err := controller.DB.Preload("Company").First(&certificate, id).Error; err != nil {
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

func (controller *CertificateHandler) CreateCertificateRender(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "curriculum", "view", "Certificate.tpl")
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

func (controller *CertificateHandler) CreateCertificate(context *fiber.Ctx) error {
	var newCertificate model.Certificate

	if err := context.BodyParser(&newCertificate); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	// Check if company exists before creating certificate
	if newCertificate.CompanyId != 0 {
		var company model.Company
		if err := controller.DB.First(&company, "id = ?", newCertificate.CompanyId).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "company not found with the provided company_id",
			})
		}
	}

	if err := controller.DB.Create(&newCertificate).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create certificate",
		})
	}

	var createdCertificate model.Certificate
	if err := controller.DB.Preload("Company").First(&createdCertificate, newCertificate.ID).Error; err != nil {
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

func (controller *CertificateHandler) UpdateCertificate(context *fiber.Ctx) error {
	var updatedCertificate model.Certificate

	if err := context.BodyParser(&updatedCertificate); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	var existingCertificate model.Certificate
	if err := controller.DB.First(&existingCertificate, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	if updatedCertificate.CertificateName != "" {
		existingCertificate.CertificateName = updatedCertificate.CertificateName
	}

	if updatedCertificate.CompanyId != 0 {
		// Validate company exists
		var company model.Company
		if err := controller.DB.First(&company, "id = ?", updatedCertificate.CompanyId).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "company not found with the provided company_id",
			})
		}
		existingCertificate.CompanyId = updatedCertificate.CompanyId
	}

	if err := controller.DB.Save(&existingCertificate).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update certificate",
		})
	}

	// Reload with company data
	var resultCertificate model.Certificate
	if err := controller.DB.Preload("Company").First(&resultCertificate, existingCertificate.ID).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    existingCertificate,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    resultCertificate,
	})
}

func (controller *CertificateHandler) DeleteCertificate(context *fiber.Ctx) error {
	if err := controller.DB.Delete(&model.Certificate{}, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete certificate",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "certificate deleted successfully",
	})
}
