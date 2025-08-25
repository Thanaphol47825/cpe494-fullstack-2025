package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type CourseHandler struct{}

func NewCourseHandler() *CourseHandler {
	return &CourseHandler{}
}

func (controller *CourseHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Course")
}

func (c *CourseHandler) GetCourses(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/curriculum/Course.json"
	CoursesMapper, err := utils.CreateMapper[model.Course](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get Courses",
		})
	}

	Courses := CoursesMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Courses,
	})
}
