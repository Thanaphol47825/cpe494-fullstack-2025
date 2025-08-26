package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type InternshipAttendanceHandler struct{}

func NewInternshipAttendanceHandler() *InternshipAttendanceHandler {
	return &InternshipAttendanceHandler{}
}

func (controller *InternshipAttendanceHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipAttendance")
}

func (c *InternshipAttendanceHandler) GetInternshipAttendances(context *fiber.Ctx) error {
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
