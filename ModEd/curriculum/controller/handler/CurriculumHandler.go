package handler

import (
	"ModEd/curriculum/model"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CurriculumHandler struct {
	DB *gorm.DB
}

func NewCurriculumHandler() *CurriculumHandler {
	return &CurriculumHandler{}
}

func (h *CurriculumHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Helloo curriculum")
}

func (c *CurriculumHandler) CreateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := c.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "",
	})
}

func (c *CurriculumHandler) GetCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.Curriculum
	if err := c.DB.Preload("CourseList").Where("id = ?", id).First(&result).Error; err != nil {
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

// Read all
func (c *CurriculumHandler) GetCurriculums(context *fiber.Ctx) error {
	// filePath := "/workspace/ModEd/curriculum/data/curriculum.json"
	// curriculumsMapper, err := utils.CreateMapper[model.Curriculum](filePath)
	// if err != nil {
	// 	return context.JSON(fiber.Map{
	// 		"isSuccess": false,
	// 		"result":    "failed to get curriculums",
	// 	})
	// }

	// curriculums := curriculumsMapper.Deserialize()

	var curriculums []model.Curriculum
	if err := c.DB.Preload("CourseList").Find(&curriculums).Error; err != nil {
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
func (c *CurriculumHandler) UpdateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	result := c.DB.Model(payload).Where("id = ?", payload.ID).Updates(payload)
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "",
	})
}

// Delete
func (c *CurriculumHandler) DeleteCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	result := c.DB.Where("id = ?", id).Delete(&model.Curriculum{})
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "",
	})
}

// func (c *CurriculumHandler) CreateSeedCurriculum(context *fiber.Ctx) error {
// 	return context.JSON(fiber.Map{
// 		"isSuccess": true,
// 		"result":    "",
// 	})
// }
