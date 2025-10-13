package handler

import (
	common "ModEd/common/model"
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type CurriculumHandler struct {
	// DB       *gorm.DB
	Application *core.ModEdApplication
}

func NewCurriculumHandler() *CurriculumHandler {
	return &CurriculumHandler{}
}

func (h *CurriculumHandler) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(h.Application.RootPath, "curriculum", "view", "Curriculum.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to load template",
		})
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Curriculum",
		"RootURL": h.Application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (h *CurriculumHandler) CreateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to create curriculum",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

func (h *CurriculumHandler) GetCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.Curriculum
	if err := h.Application.DB.Preload("CourseList").Preload("Department").Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculum",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

func (h *CurriculumHandler) GetProgramTypeOptions(context *fiber.Ctx) error {
	keys := make([]int, 0, len(common.ProgramTypeLabel))
	for k := range common.ProgramTypeLabel {
		keys = append(keys, int(k))
	}
	sort.Ints(keys)

	options := make([]map[string]interface{}, 0, len(keys))
	for _, v := range keys {
		pt := common.ProgramType(v)
		options = append(options, map[string]interface{}{
			"value": strconv.Itoa(v),
			"label": pt.String(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    options,
	})
}

// Read all
func (h *CurriculumHandler) GetCurriculums(context *fiber.Ctx) error {
	var curriculums []model.Curriculum
	if err := h.Application.DB.Preload("CourseList").Preload("Department").Find(&curriculums).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    curriculums,
	})
}

// Update
func (h *CurriculumHandler) UpdateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	result := h.Application.DB.Model(payload).Where("id = ?", payload.ID).Updates(payload)
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

// Delete
func (h *CurriculumHandler) DeleteCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	result := h.Application.DB.Where("id = ?", id).Delete(&model.Curriculum{})
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

// func (c *CurriculumHandler) CreateSeedCurriculum(context *fiber.Ctx) error {
// 	return context.JSON(fiber.Map{
// 		"isSuccess": true,
// 		"result":    "",
// 	})
// }
