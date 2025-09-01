package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipReportHandler struct {
	DB *gorm.DB
}

func (controller *InternshipReportHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipReport")
}

func (controller *InternshipReportHandler) GetAllInternshipReport(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/Report.csv"
	reportMapper, err := core.CreateMapper[model.InternshipReport](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get internship report",
		})
	}

	reports := reportMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    reports,
	})
}

func (controller *InternshipReportHandler) CreateInternshipReport(context *fiber.Ctx) error {
	var newReport model.InternshipReport

	if err := context.BodyParser(&newReport); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newReport).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create internship report",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newReport,
	})
}

func (controller *InternshipReportHandler) GetInternshipReportByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var report model.InternshipReport
	if err := controller.DB.First(&report, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship report not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    report,
	})
}

func (controller *InternshipReportHandler) UpdateInternshipReportByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var report model.InternshipReport
	if err := controller.DB.First(&report, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship report not found",
		})
	}

	var updateReport model.InternshipReport
	if err := context.BodyParser(&updateReport); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	report.ReportScore = updateReport.ReportScore

	if err := controller.DB.Save(&report).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update internship report",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    report,
	})
}

func (controller *InternshipReportHandler) DeleteInternshipReportByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var report model.InternshipReport
	if err := controller.DB.First(&report, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship report not found",
		})
	}

	if err := controller.DB.Delete(&report, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete internship report",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "successfully deleted internship report",
	})
}
