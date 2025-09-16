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

type InternshipResultEvaluationHandler struct {
	DB  *gorm.DB
	app *core.ModEdApplication
}

// ให้ controller เรียก เพื่อส่ง app เข้ามาใช้ RootPath/RootURL
func (h *InternshipResultEvaluationHandler) SetApplication(app *core.ModEdApplication) { h.app = app }

func (h *InternshipResultEvaluationHandler) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Hello curriculum/InternshipResultEvaluation")
}

func (h *InternshipResultEvaluationHandler) RenderCreateForm(c *fiber.Ctx) error {
	success := c.Query("success") == "1"
	errMsg := c.Query("error")

	tplPath := filepath.Join(h.app.RootPath, "curriculum", "view", "InternshipResultEvaluation.tpl")
	tpl, err := mustache.ParseFile(tplPath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to parse template",
		})
	}

	html := tpl.Render(map[string]any{
		"title":   "Create Result Evaluation",
		"RootURL": h.app.RootURL,
		"success": success,
		"error":   errMsg,
	})

	c.Set("Content-Type", "text/html")
	return c.SendString(html)
}

// ---------- CRUD (DB ล้วน) ----------

func (h *InternshipResultEvaluationHandler) GetAllInternshipResultEvaluation(c *fiber.Ctx) error {
	var items []model.InternshipResultEvaluation
	if err := h.DB.Preload("InternshipInformation").Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to fetch result evaluations",
		})
	}
	return c.JSON(fiber.Map{"isSuccess": true, "result": items})
}

func (h *InternshipResultEvaluationHandler) CreateInternshipResultEvaluation(c *fiber.Ctx) error {
	var in model.InternshipResultEvaluation
	if err := c.BodyParser(&in); err != nil {
		return c.Redirect("/curriculum/InternshipResultEvaluation/create?error="+url.QueryEscape("invalid request body"), fiber.StatusSeeOther)
	}

	// กันกรณีฟอร์มเป็น string
	if in.Score == 0 {
		if v := c.FormValue("Score"); v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				in.Score = uint(n)
			}
		}
	}
	if in.InternshipInformationId == 0 {
		if v := c.FormValue("InternshipInformationId"); v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				in.InternshipInformationId = uint(n)
			}
		}
	}

	// Validation
	if in.Score > 100 {
		return c.Redirect("/curriculum/InternshipResultEvaluation/create?error="+url.QueryEscape("Score must be 0-100"), fiber.StatusSeeOther)
	}
	if in.InternshipInformationId == 0 {
		return c.Redirect("/curriculum/InternshipResultEvaluation/create?error="+url.QueryEscape("InternshipInformationId is required"), fiber.StatusSeeOther)
	}

	if err := h.DB.Create(&in).Error; err != nil {
		return c.Redirect("/curriculum/InternshipResultEvaluation/create?error="+url.QueryEscape("failed to create"), fiber.StatusSeeOther)
	}

	return c.Redirect("/curriculum/InternshipResultEvaluation/create?success=1", fiber.StatusSeeOther)
}

func (h *InternshipResultEvaluationHandler) GetInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var item model.InternshipResultEvaluation
	if err := h.DB.Preload("InternshipInformation").First(&item, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false, "error": "result evaluation not found",
		})
	}
	return c.JSON(fiber.Map{"isSuccess": true, "result": item})
}

func (h *InternshipResultEvaluationHandler) UpdateInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.InternshipResultEvaluation
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false, "error": "result evaluation not found",
		})
	}

	var in model.InternshipResultEvaluation
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false, "error": "invalid request body",
		})
	}

	if in.Score > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false, "error": "Score must be 0-100",
		})
	}
	if in.Comment != "" {
		existing.Comment = in.Comment
	}
	if in.Score != 0 {
		existing.Score = in.Score
	}
	if in.InternshipInformationId != 0 {
		existing.InternshipInformationId = in.InternshipInformationId
	}

	if err := h.DB.Save(&existing).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to update",
		})
	}

	return c.JSON(fiber.Map{"isSuccess": true, "result": existing})
}

func (h *InternshipResultEvaluationHandler) DeleteInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")

	tx := h.DB.Delete(&model.InternshipResultEvaluation{}, "id = ?", id)
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false, "error": "failed to delete", "detail": tx.Error.Error(),
		})
	}
	if tx.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false, "error": "result evaluation not found",
		})
	}

	return c.JSON(fiber.Map{"isSuccess": true, "result": "deleted"})
}
