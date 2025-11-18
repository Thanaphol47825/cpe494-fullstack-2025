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

// Helper function to get role from request
func (controller *InternshipMentorHandler) getUserRole(context *fiber.Ctx) string {
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

// Helper function to check if user is Admin
func (controller *InternshipMentorHandler) isAdmin(role string) bool {
    return role == "Admin"
}

func (controller *InternshipMentorHandler) RenderMain(context *fiber.Ctx) error {
    return context.SendString("Hello curriculum/InternshipMentor")
}

// GET - Only Admin can access
func (controller *InternshipMentorHandler) GetInternshipMentor(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can view mentors",
        })
    }

    id := context.Params("id")
    companyID := context.Query("company_id")

    // Case 1: Get specific mentor by ID
    if id != "" {
        var mentor model.InternshipMentor
        if err := controller.DB.Preload("Company").First(&mentor, id).Error; err != nil {
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

    // Case 2: Filter by query parameters or get all
    query := controller.DB.Preload("Company")
    
    // Apply filters if provided
    if companyID != "" {
        query = query.Where("company_id = ?", companyID)
    }

    var mentors []model.InternshipMentor
    if err := query.Find(&mentors).Error; err != nil {
        return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "failed to fetch mentors",
        })
    }

    return context.JSON(fiber.Map{
        "isSuccess": true,
        "result":    mentors,
        "count":     len(mentors),
    })
}

// GET All - Only Admin can access
func (controller *InternshipMentorHandler) GetAllInternshipMentor(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can view mentors",
        })
    }

    var mentors []model.InternshipMentor
    if err := controller.DB.Preload("Company").Find(&mentors).Error; err != nil {
        return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "failed to fetch internship mentors",
        })
    }
    
    return context.JSON(fiber.Map{
        "isSuccess": true,
        "result":    mentors,
        "count":     len(mentors),
    })
}

// Render - Only Admin can access
func (controller *InternshipMentorHandler) CreateInternshipMentorRender(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can create mentors",
        })
    }

    path := filepath.Join(controller.application.RootPath, "curriculum", "view", "InternshipMentor.tpl")
    template, err := mustache.ParseFile(path)
    if err != nil {
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

// CREATE - Only Admin
func (controller *InternshipMentorHandler) CreateInternshipMentor(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can create mentors",
        })
    }

    var newMentor model.InternshipMentor

    if err := context.BodyParser(&newMentor); err != nil {
        return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "failed to parse request body",
        })
    }

    // Validate company exists if company_id is provided
    if newMentor.CompanyId != 0 {
        var company model.Company
        if err := controller.DB.First(&company, "id = ?", newMentor.CompanyId).Error; err != nil {
            return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "isSuccess": false,
                "error":     "company not found with the provided company_id",
            })
        }
    }

    if err := controller.DB.Create(&newMentor).Error; err != nil {
        return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "failed to create mentor",
        })
    }

    // Reload with company data
    var createdMentor model.InternshipMentor
    if err := controller.DB.Preload("Company").First(&createdMentor, newMentor.ID).Error; err != nil {
        return context.JSON(fiber.Map{
            "isSuccess": true,
            "result":    newMentor,
        })
    }

    return context.JSON(fiber.Map{
        "isSuccess": true,
        "result":    createdMentor,
    })
}

// UPDATE - Only Admin
func (controller *InternshipMentorHandler) UpdateInternshipMentor(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can update mentors",
        })
    }

    id := context.Params("id")

    var mentor model.InternshipMentor
    if err := controller.DB.First(&mentor, id).Error; err != nil {
        return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "mentor not found",
        })
    }

    var input struct {
        MentorFirstName string `json:"mentor_first_name"`
        MentorLastName  string `json:"mentor_last_name"`
        MentorEmail     string `json:"mentor_email"`
        MentorPhone     string `json:"mentor_phone"`
        CompanyId       uint   `json:"company_id"`
    }

    if err := context.BodyParser(&input); err != nil {
        return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "invalid request body",
        })
    }

    // Validate company exists if company_id is being updated
    if input.CompanyId != 0 && input.CompanyId != mentor.CompanyId {
        var company model.Company
        if err := controller.DB.First(&company, "id = ?", input.CompanyId).Error; err != nil {
            return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "isSuccess": false,
                "error":     "company not found with the provided company_id",
            })
        }
    }

    // Update fields
    if input.MentorFirstName != "" {
        mentor.MentorFirstName = input.MentorFirstName
    }
    if input.MentorLastName != "" {
        mentor.MentorLastName = input.MentorLastName
    }
    if input.MentorEmail != "" {
        mentor.MentorEmail = input.MentorEmail
    }
    if input.MentorPhone != "" {
        mentor.MentorPhone = input.MentorPhone
    }
    if input.CompanyId != 0 {
        mentor.CompanyId = input.CompanyId
    }

    if err := controller.DB.Save(&mentor).Error; err != nil {
        return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "failed to update mentor",
        })
    }

    // Reload with company data
    var updatedMentor model.InternshipMentor
    if err := controller.DB.Preload("Company").First(&updatedMentor, mentor.ID).Error; err != nil {
        return context.JSON(fiber.Map{
            "isSuccess": true,
            "result":    mentor,
        })
    }

    return context.JSON(fiber.Map{
        "isSuccess": true,
        "result":    updatedMentor,
    })
}

// DELETE - Only Admin
func (controller *InternshipMentorHandler) DeleteInternshipMentor(context *fiber.Ctx) error {
    role := controller.getUserRole(context)
    
    if !controller.isAdmin(role) {
        return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "access denied - only Admin can delete mentors",
        })
    }

    id := context.Params("id")
    
    // Check if mentor exists before deleting
    var mentor model.InternshipMentor
    if err := controller.DB.First(&mentor, id).Error; err != nil {
        return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "isSuccess": false,
            "error":     "mentor not found",
        })
    }

    if err := controller.DB.Delete(&mentor).Error; err != nil {
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