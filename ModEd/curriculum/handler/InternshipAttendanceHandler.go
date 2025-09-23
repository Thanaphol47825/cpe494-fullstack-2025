package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type InternshipAttendanceHandler struct {
	Application *core.ModEdApplication
}

func NewInternshipAttendanceHandler() *InternshipAttendanceHandler {
	return &InternshipAttendanceHandler{}
}

//	func (controller *InternshipAttendanceHandler) RenderMain(context *fiber.Ctx) error {
//		return context.SendString("Hello curriculum/InternshipAttendance")
//	}
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
	filePath := "/workspace/ModEd/curriculum/data/internship/Attendance.csv"
	attendanceMapper, err := core.CreateMapper[model.InternshipAttendance](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get attendance",
		})
	}
	attendance := attendanceMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    attendance,
	})
}

func (c *InternshipAttendanceHandler) CreateInternshipAttendance(context *fiber.Ctx) error {
	var newAttendance model.InternshipAttendance
	if err := context.BodyParser(&newAttendance); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	fmt.Println("2")
	if err := c.Application.DB.Create(&newAttendance).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create internship attendance",
		})
	}
	fmt.Println("3")

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newAttendance,
	})
}

func (c *InternshipAttendanceHandler) GetInternshipAttendanceByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var attendance model.InternshipAttendance

	if err := c.Application.DB.First(&attendance, id).Error; err != nil {
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
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    attendance,
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
