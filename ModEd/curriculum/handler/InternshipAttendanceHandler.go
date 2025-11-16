package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type InternshipAttendanceHandler struct {
	Application *core.ModEdApplication
}

func NewInternshipAttendanceHandler() *InternshipAttendanceHandler {
	return &InternshipAttendanceHandler{}
}

func (c *InternshipAttendanceHandler) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(c.Application.RootPath, "curriculum", "view", "InternshipAttendance.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.SendStatus(http.StatusInternalServerError)
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Internship Attendance",
		"RootURL": c.Application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")
	return context.SendString(rendered)
}

func (c *InternshipAttendanceHandler) GetAllInternshipAttendances(context *fiber.Ctx) error {
	var attendances []model.InternshipAttendance

	// Preload InternshipInformation and its nested relationships
	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		Find(&attendances).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get attendance",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    attendances,
	})
}

func (c *InternshipAttendanceHandler) CreateInternshipAttendance(context *fiber.Ctx) error {
	var payload map[string]interface{}

	if err := context.BodyParser(&payload); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fmt.Sprintf("invalid request body: %v", err),
		})
	}

	var newAttendance model.InternshipAttendance

	// Parse date (RFC3339 format: 2025-11-03T00:00:00Z)
	if dateStr, ok := payload["date"].(string); ok && dateStr != "" {
		if date, err := time.Parse(time.RFC3339, dateStr); err == nil {
			newAttendance.Date = date
		} else {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     fmt.Sprintf("invalid date format: %v", err),
			})
		}
	}

	// Parse check-in time (RFC3339 format: 2025-11-03T08:30:00Z)
	if checkInStr, ok := payload["check_in_time"].(string); ok && checkInStr != "" {
		if checkIn, err := time.Parse(time.RFC3339, checkInStr); err == nil {
			newAttendance.CheckInTime = checkIn
		} else {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     fmt.Sprintf("invalid check-in time format: %v", err),
			})
		}
	}

	// Parse check-out time (RFC3339 format: 2025-11-03T17:00:00Z) - OPTIONAL
	// Check-out time can be added later via update endpoint
	if checkOutStr, ok := payload["check_out_time"].(string); ok && checkOutStr != "" {
		if checkOut, err := time.Parse(time.RFC3339, checkOutStr); err == nil {
			newAttendance.CheckOutTime = &checkOut
		} else {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     fmt.Sprintf("invalid check-out time format: %v", err),
			})
		}
	}

	// Parse other fields
	if status, ok := payload["check_in_status"].(bool); ok {
		newAttendance.CheckInStatus = status
	}

	if work, ok := payload["assing_work"].(string); ok {
		newAttendance.AssingWork = work
	}

	// Resolve student_info_id: accept either student_info_id directly or student_id (Student table primary ID)
	if studentInfoID, ok := payload["student_info_id"].(float64); ok {
		newAttendance.StudentInfoID = uint(studentInfoID)
	}

	// If student_info_id not provided, accept student_id (Student.ID) and resolve to InternshipInformation
	if newAttendance.StudentInfoID == 0 {
		if studentIDFloat, ok := payload["student_id"].(float64); ok {
			studentID := uint(studentIDFloat)

			// Find intern student record by student_id (foreign key to Student table)
			var internStudent model.InternStudent
			if err := c.Application.DB.Where("student_id = ?", studentID).First(&internStudent).Error; err != nil {
				return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"isSuccess": false,
					"error":     fmt.Sprintf("no intern student found for student_id %d", studentID),
				})
			}

			// Find internship information associated with the intern student
			var internInfo model.InternshipInformation
			if err := c.Application.DB.Where("intern_student_id = ?", internStudent.ID).First(&internInfo).Error; err != nil {
				return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"isSuccess": false,
					"error":     fmt.Sprintf("no internship information found for intern student %d", internStudent.ID),
				})
			}

			newAttendance.StudentInfoID = internInfo.ID
		}
	}

	// Validate that student_info_id is provided after resolution
	if newAttendance.StudentInfoID == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student_info_id or student_id is required",
		})
	}

	// Check if InternshipInformation exists (final check)
	var internInfo model.InternshipInformation
	if err := c.Application.DB.First(&internInfo, newAttendance.StudentInfoID).Error; err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fmt.Sprintf("internship information with ID %d not found", newAttendance.StudentInfoID),
		})
	}

	if err := c.Application.DB.Create(&newAttendance).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fmt.Sprintf("failed to create internship attendance: %v", err),
		})
	}

	// Reload with relationships
	var createdAttendance model.InternshipAttendance
	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		First(&createdAttendance, newAttendance.ID).Error; err != nil {
		return context.Status(fiber.StatusCreated).JSON(fiber.Map{
			"isSuccess": true,
			"result":    newAttendance,
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    createdAttendance,
	})
}

func (c *InternshipAttendanceHandler) GetInternshipAttendanceByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var attendance model.InternshipAttendance

	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		First(&attendance, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship attendance not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    attendance,
	})
}

func (c *InternshipAttendanceHandler) UpdateInternshipAttendanceByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var attendance model.InternshipAttendance

	if err := c.Application.DB.First(&attendance, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship attendance not found",
		})
	}

	var updatedData model.InternshipAttendance
	if err := context.BodyParser(&updatedData); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}
	if err := c.Application.DB.Model(&attendance).Updates(updatedData).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update internship attendance",
		})
	}

	// Reload with relationships
	var updatedAttendance model.InternshipAttendance
	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		First(&updatedAttendance, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    attendance,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    updatedAttendance,
	})
}

// UpdateInternshipAttendance updates attendance record (ID from request body)
func (c *InternshipAttendanceHandler) UpdateInternshipAttendance(context *fiber.Ctx) error {
	var payload map[string]interface{}

	if err := context.BodyParser(&payload); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fmt.Sprintf("invalid request body: %v", err),
		})
	}

	// Get ID from payload
	var attendanceID uint
	if id, ok := payload["ID"].(float64); ok {
		attendanceID = uint(id)
	} else if id, ok := payload["id"].(float64); ok {
		attendanceID = uint(id)
	}

	if attendanceID == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "attendance ID is required in request body",
		})
	}

	var attendance model.InternshipAttendance
	if err := c.Application.DB.First(&attendance, attendanceID).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship attendance not found",
		})
	}

	// Update check-out time if provided
	if checkOutStr, ok := payload["check_out_time"].(string); ok && checkOutStr != "" {
		if checkOut, err := time.Parse(time.RFC3339, checkOutStr); err == nil {
			attendance.CheckOutTime = &checkOut
		} else {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     fmt.Sprintf("invalid check-out time format: %v", err),
			})
		}
	}

	// Update other fields if provided
	if checkInStr, ok := payload["check_in_time"].(string); ok && checkInStr != "" {
		if checkIn, err := time.Parse(time.RFC3339, checkInStr); err == nil {
			attendance.CheckInTime = checkIn
		}
	}

	if dateStr, ok := payload["date"].(string); ok && dateStr != "" {
		if date, err := time.Parse(time.RFC3339, dateStr); err == nil {
			attendance.Date = date
		}
	}

	if status, ok := payload["check_in_status"].(bool); ok {
		attendance.CheckInStatus = status
	}

	if work, ok := payload["assing_work"].(string); ok {
		attendance.AssingWork = work
	}

	// Save updates
	if err := c.Application.DB.Save(&attendance).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fmt.Sprintf("failed to update internship attendance: %v", err),
		})
	}

	// Reload with relationships
	var updatedAttendance model.InternshipAttendance
	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		First(&updatedAttendance, attendanceID).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    attendance,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    updatedAttendance,
	})
}

func (c *InternshipAttendanceHandler) DeleteInternshipAttendanceByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var attendance model.InternshipAttendance

	if err := c.Application.DB.First(&attendance, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship attendance not found",
		})
	}

	if err := c.Application.DB.Delete(&attendance).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete internship attendance",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "internship attendance deleted successfully",
	})
}

// GetTodayAttendanceByStudentID gets today's attendance for a specific student by student ID
func (c *InternshipAttendanceHandler) GetTodayAttendanceByStudentID(context *fiber.Ctx) error {
	studentIDParam := context.Params("student_id")

	if studentIDParam == "" {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student_id is required",
		})
	}

	// Get today's date (start and end of day)
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	// Step 1: Find the intern student record using student_id (from Student table)
	var internStudent model.InternStudent
	if err := c.Application.DB.Where("student_id = ?", studentIDParam).First(&internStudent).Error; err != nil {
		// No intern student found
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    nil,
			"message":   "No internship student record found for this student",
		})
	}

	// Step 2: Find internship information using intern_student_id
	var internInfo model.InternshipInformation
	if err := c.Application.DB.Where("intern_student_id = ?", internStudent.ID).First(&internInfo).Error; err != nil {
		// No internship information found
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    nil,
			"message":   "No internship information found for this intern student",
		})
	}

	// Step 3: Find today's attendance using student_info_id
	var attendance model.InternshipAttendance
	if err := c.Application.DB.
		Preload("InternshipInformation").
		Preload("InternshipInformation.InternStudent").
		Preload("InternshipInformation.InternStudent.Student").
		Where("student_info_id = ?", internInfo.ID).
		Where("date >= ?", startOfDay).
		Where("date < ?", endOfDay).
		First(&attendance).Error; err != nil {
		// No attendance found for today
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    nil,
			"message":   "No attendance record found for today",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    attendance,
	})
}
