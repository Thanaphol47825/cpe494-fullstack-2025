package controller

import (
	"ModEd/common/model"
	"ModEd/common/util"
	"ModEd/core"
	"fmt"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type InstructorController struct {
	application *core.ModEdApplication
}

func (controller *InstructorController) GetAllInstructors(context *fiber.Ctx) error {
	var instructors []model.Instructor
	// Filter out soft-deleted records
	result := controller.application.DB.Where("is_drop = ?", false).Find(&instructors)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    instructors,
	})
}

func (controller *InstructorController) GetInstructor(context *fiber.Ctx) error {
	id := context.Params("id")
	var instructor model.Instructor
	result := controller.application.DB.First(&instructor, id)

	if result.Error != nil {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Instructor not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    instructor,
	})
}

func (controller *InstructorController) CreateInstructor(context *fiber.Ctx) error {
	var instructor model.Instructor
	if err := context.BodyParser(&instructor); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	result := controller.application.DB.Create(&instructor)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	return context.Status(201).JSON(fiber.Map{
		"isSuccess": true,
		"result":    instructor,
	})
}

func (controller *InstructorController) UpdateInstructor(context *fiber.Ctx) error {
	id := context.Params("id")
	var instructor model.Instructor

	if err := controller.application.DB.First(&instructor, id).Error; err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Instructor not found",
		})
	}

	if err := context.BodyParser(&instructor); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	instructorID, _ := strconv.Atoi(id)
	instructor.ID = uint(instructorID)
	controller.application.DB.Save(&instructor)

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    instructor,
	})
}

func (controller *InstructorController) DeleteInstructor(context *fiber.Ctx) error {
	id := context.Params("id")
	// Soft delete: set is_drop = true
	result := controller.application.DB.Model(&model.Instructor{}).Where("id = ?", id).Update("is_drop", true)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	if result.RowsAffected == 0 {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Instructor not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fmt.Sprintf("Instructor %s deleted", id),
	})
}

func (controller *InstructorController) ImportJSON(context *fiber.Ctx) error {
	filePath := context.Query("file")
	if filePath == "" {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "file parameter required",
		})
	}

	err := util.ImportInstructorsFromJSON(filePath, controller.application)
	if err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "file parameter required",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Instructors imported successfully from JSON",
	})
}

func NewInstructorController() *InstructorController {
	controller := &InstructorController{}
	return controller
}

func (controller *InstructorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *InstructorController) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "common", "view", "Instructor.tpl")
	template, _ := mustache.ParseFile(path)
	rendered := template.Render(map[string]string{
		"title":   "ModEd Instructor Form",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InstructorController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var instructors []*model.Instructor
	result := controller.application.DB.Find(&instructors)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validInstructors := []*model.Instructor{}
	for _, d := range instructors {
		if err := d.Validate(); err == nil {
			validInstructors = append(validInstructors, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validInstructors,
	})
}

func (controller *InstructorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors",
		Handler:        controller.RenderMain,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/getinfo",
		Handler:        controller.GetInfo,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/getall",
		Handler:        controller.GetAllInstructors,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/:id",
		Handler:        controller.GetInstructor,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors",
		Handler:        controller.CreateInstructor,
		Method:         core.POST,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/:id",
		Handler:        controller.UpdateInstructor,
		Method:         core.POST,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/delete/:id",
		Handler:        controller.DeleteInstructor,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/instructors/import/json",
		Handler:        controller.ImportJSON,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	return routeList
}

func (controller *InstructorController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "common/instructor",
		Model: model.Instructor{},
	})
	return modelMetaList
}
