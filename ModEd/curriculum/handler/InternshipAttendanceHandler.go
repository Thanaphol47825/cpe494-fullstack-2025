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

	// Parse check-out time (RFC3339 format: 2025-11-03T17:00:00Z)
	if checkOutStr, ok := payload["check_out_time"].(string); ok && checkOutStr != "" {
		if checkOut, err := time.Parse(time.RFC3339, checkOutStr); err == nil {
			newAttendance.CheckOutTime = checkOut
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

	// Get student_info_id from payload
	if studentInfoID, ok := payload["student_info_id"].(float64); ok {
		newAttendance.StudentInfoID = uint(studentInfoID)
	}

	// Validate that student_info_id is provided
	if newAttendance.StudentInfoID == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student_info_id is required",
		})
	}

	// Check if InternshipInformation exists
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
