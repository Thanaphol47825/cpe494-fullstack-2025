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

type FacultyController struct {
	application *core.ModEdApplication
}

func (controller *FacultyController) GetAllFaculties(context *fiber.Ctx) error {
	var faculties []model.Faculty
	// Filter out soft-deleted records
	result := controller.application.DB.Where("is_drop = ?", false).Find(&faculties)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    faculties,
	})
}

func (controller *FacultyController) GetFaculty(context *fiber.Ctx) error {
	id := context.Params("id")
	var faculty model.Faculty
	result := controller.application.DB.First(&faculty, id)
	if result.Error != nil {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Faculty not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    faculty,
	})
}

func (controller *FacultyController) CreateFaculty(context *fiber.Ctx) error {
	var faculty model.Faculty
	if err := context.BodyParser(&faculty); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	result := controller.application.DB.Create(&faculty)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	return context.Status(201).JSON(fiber.Map{
		"isSuccess": true,
		"result":    faculty,
	})
}

func (controller *FacultyController) UpdateFaculty(context *fiber.Ctx) error {
	id := context.Params("id")
	var faculty model.Faculty

	if err := controller.application.DB.First(&faculty, id).Error; err != nil {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Faculty not found",
		})
	}

	if err := context.BodyParser(&faculty); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	facultyID, _ := strconv.Atoi(id)
	faculty.ID = uint(facultyID)
	controller.application.DB.Save(&faculty)
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    faculty,
	})
}

func (controller *FacultyController) DeleteFaculty(context *fiber.Ctx) error {
	id := context.Params("id")
	// Soft delete: set is_drop = true
	result := controller.application.DB.Model(&model.Faculty{}).Where("id = ?", id).Update("is_drop", true)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	if result.RowsAffected == 0 {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Faculty not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Faculty deleted",
	})
}

func (controller *FacultyController) ImportJSON(context *fiber.Ctx) error {
	filePath := context.Query("file")
	if filePath == "" {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "file parameter required",
		})
	}

	err := util.ImportFacultiesFromJSON(filePath, controller.application)
	if err != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Faculties imported successfully from JSON",
	})
}

func NewFacultyController() *FacultyController {
	controller := &FacultyController{}
	return controller
}

func (controller *FacultyController) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "common", "view", "Faculty.tpl")
	template, _ := mustache.ParseFile(path)
	rendered := template.Render(map[string]string{
		"title":   "ModEd Faculty Form",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *FacultyController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var faculties []*model.Faculty
	result := controller.application.DB.Find(&faculties)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validFaculties := []*model.Faculty{}
	for _, d := range faculties {
		if err := d.Validate(); err == nil {
			validFaculties = append(validFaculties, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validFaculties,
	})
}

func (controller *FacultyController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties",
		Handler:        controller.RenderMain,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/getinfo",
		Handler:        controller.GetInfo,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/getall",
		Handler:        controller.GetAllFaculties,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/:id",
		Handler:        controller.GetFaculty,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthNone},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties",
		Handler:        controller.CreateFaculty,
		Method:         core.POST,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/:id",
		Handler:        controller.UpdateFaculty,
		Method:         core.POST,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/delete/:id",
		Handler:        controller.DeleteFaculty,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:          "common/faculties/import/json",
		Handler:        controller.ImportJSON,
		Method:         core.GET,
		Authentication: core.Authentication{AuthType: core.AuthAdmin},
	})
	return routeList
}

func (controller *FacultyController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "common/faculty",
		Model: model.Faculty{},
	})
	return modelMetaList
}

func (controller *FacultyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
