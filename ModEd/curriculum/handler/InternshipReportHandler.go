package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/url"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternshipReportHandler struct {
	DB  *gorm.DB
	app *core.ModEdApplication 
}

func (h *InternshipReportHandler) SetApplication(app *core.ModEdApplication) { h.app = app }

func (h *InternshipReportHandler) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Hello curriculum/InternshipReport")
}

func (h *InternshipReportHandler) RenderCreateForm(c *fiber.Ctx) error {
	success := c.Query("success") == "1"
	errMsg := c.Query("error")

	tplPath := filepath.Join(h.app.RootPath, "curriculum", "view", "InternshipReport.tpl")
	tpl, err := mustache.ParseFile(tplPath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to parse template",
		})
	}

	html := tpl.Render(map[string]any{
		"title":   "Create Internship Report",
		"RootURL": h.app.RootURL,
		"success": success,
		"error":   errMsg,
	})

	c.Set("Content-Type", "text/html")
	return c.SendString(html)
}

// ---------- CRUD (ใช้ DB ล้วน) ----------

func (h *InternshipReportHandler) GetAllInternshipReport(c *fiber.Ctx) error {
	var reports []model.InternshipReport
	if err := h.DB.Find(&reports).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to fetch internship reports",
		})
	}
	return c.JSON(fiber.Map{"isSuccess": true, "result": reports})
}

func (h *InternshipReportHandler) CreateInternshipReport(c *fiber.Ctx) error {
	var in model.InternshipReport
	if err := c.BodyParser(&in); err != nil {
		return c.Redirect("/curriculum/InternshipReport/create?error="+url.QueryEscape("invalid request body"), fiber.StatusSeeOther)
	}
	if in.ReportScore == 0 {
		if v := c.FormValue("ReportScore"); v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				in.ReportScore = n
			}
		}
	}

	if in.ReportScore < 0 || in.ReportScore > 100 {
		return c.Redirect("/curriculum/InternshipReport/create?error="+url.QueryEscape("ReportScore must be 0-100"), fiber.StatusSeeOther)
	}

	if err := h.DB.Create(&in).Error; err != nil {
		return c.Redirect("/curriculum/InternshipReport/create?error="+url.QueryEscape("failed to create internship report"), fiber.StatusSeeOther)
	}

	// PRG: POST → Redirect
	return c.Redirect("/curriculum/InternshipReport/create?success=1", fiber.StatusSeeOther)
}

func (h *InternshipReportHandler) GetInternshipReportByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var report model.InternshipReport
	if err := h.DB.First(&report, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false, "error": "internship report not found",
		})
	}
	return c.JSON(fiber.Map{"isSuccess": true, "result": report})
}

func (h *InternshipReportHandler) UpdateInternshipReportByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var report model.InternshipReport
	if err := h.DB.First(&report, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false, "error": "internship report not found",
		})
	}

	var in model.InternshipReport
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false, "error": "invalid request body",
		})
	}

	if in.ReportScore < 0 || in.ReportScore > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false, "error": "ReportScore must be 0-100",
		})
	}

	report.ReportScore = in.ReportScore

	if err := h.DB.Save(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to update internship report",
		})
	}

	return c.JSON(fiber.Map{"isSuccess": true, "result": report})
}

func (h *InternshipReportHandler) DeleteInternshipReportByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.DB.Delete(&model.InternshipReport{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to delete internship report",
		})
	}
	return c.JSON(fiber.Map{"isSuccess": true, "result": "successfully deleted internship report"})
}
