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

// Helper function to get role from request
func (controller *CertificateHandler) getUserRole(context *fiber.Ctx) string {
	// Try to get from header first
	role := context.Get("X-User-Role", "")
	
	// If not found, try from query parameter
	if role == "" {
		role = context.Query("role", "")
	}
	
	// Default to Student if no role found
	if role == "" {
		role = "Student"
	}
	
	return role
}

// Helper function to check if user has permission
func (controller *CertificateHandler) hasWritePermission(role string) bool {
	return role == "Instructor" || role == "Admin"
}

func (controller *CertificateHandler) hasReadPermission(role string) bool {
	return role == "Student" || role == "Instructor" || role == "Admin"
}

func (controller *CertificateHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Certificate")
}

// GET - All roles can read (Student, Instructor, Admin)
// Supports filtering by query parameters:
// - /curriculum/Certificate/ - get all certificates
// - /curriculum/Certificate/123 - get certificate by ID
// - /curriculum/Certificate/?intern_student_id=123 - filter by student ID
// - /curriculum/Certificate/?company_id=5 - filter by company ID
func (controller *CertificateHandler) GetCertificate(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasReadPermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "insufficient permissions",
		})
	}

	id := context.Params("id")
	internStudentID := context.Query("intern_student_id")
	companyID := context.Query("company_id")

	// Case 1: Get specific certificate by ID
	if id != "" {
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

	// Case 2: Filter by query parameters or get all
	query := controller.DB.Preload("Company")
	
	// Apply filters if provided
	if internStudentID != "" {
		query = query.Where("intern_student_id = ?", internStudentID)
	}
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}

	var certificates []model.Certificate
	if err := query.Find(&certificates).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to fetch certificates",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    certificates,
		"count":     len(certificates),
	})
}

func (controller *CertificateHandler) CreateCertificateRender(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasWritePermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "only Instructor and Admin can create certificates",
		})
	}

	path := filepath.Join(controller.application.RootPath, "curriculum", "view", "Certificate.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
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

// CREATE - Only Instructor and Admin
func (controller *CertificateHandler) CreateCertificate(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasWritePermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "only Instructor and Admin can create certificates",
		})
	}

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

// UPDATE - Only Instructor and Admin
func (controller *CertificateHandler) UpdateCertificate(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasWritePermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "only Instructor and Admin can update certificates",
		})
	}

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

// DELETE - Only Instructor and Admin
func (controller *CertificateHandler) DeleteCertificate(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasWritePermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "only Instructor and Admin can delete certificates",
		})
	}

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

// GET by Student ID - Optional: ถ้าต้องการ route แยก
func (controller *CertificateHandler) GetByStudentID(context *fiber.Ctx) error {
	role := controller.getUserRole(context)
	
	if !controller.hasReadPermission(role) {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "insufficient permissions",
		})
	}

	studentID := context.Params("id")
	if studentID == "" {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student ID is required",
		})
	}

	var certificates []model.Certificate
	if err := controller.DB.Preload("Company").Where("intern_student_id = ?", studentID).Find(&certificates).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to fetch certificates",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    certificates,
		"count":     len(certificates),
	})
}