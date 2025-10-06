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

type DepartmentController struct {
	application *core.ModEdApplication
}

func (controller *DepartmentController) GetAllDepartments(context *fiber.Ctx) error {
	var departments []model.Department
	result := controller.application.DB.Find(&departments)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return context.JSON(departments)
}

func (controller *DepartmentController) GetDepartment(context *fiber.Ctx) error {
	id := context.Params("id")
	var department model.Department
	result := controller.application.DB.First(&department, id)
	if result.Error != nil {
		return context.Status(404).JSON(fiber.Map{"error": "Department not found"})
	}
	return context.JSON(department)
}

func (controller *DepartmentController) CreateDepartment(context *fiber.Ctx) error {
	var department model.Department
	if err := context.BodyParser(&department); err != nil {
		return context.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
	}

	result := controller.application.DB.Create(&department)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return context.Status(201).JSON(department)
}

func (controller *DepartmentController) UpdateDepartment(context *fiber.Ctx) error {
	id := context.Params("id")
	var department model.Department

	if err := controller.application.DB.First(&department, id).Error; err != nil {
		return context.Status(404).JSON(fiber.Map{"error": "Department not found"})
	}

	if err := context.BodyParser(&department); err != nil {
		return context.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
	}

	departmentID, _ := strconv.Atoi(id)
	department.ID = uint(departmentID)
	controller.application.DB.Save(&department)
	return context.JSON(department)
}

func (controller *DepartmentController) DeleteDepartment(context *fiber.Ctx) error {
	id := context.Params("id")
	result := controller.application.DB.Delete(&model.Department{}, id)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return context.JSON(fiber.Map{"message": "Department deleted"})
}

func (controller *DepartmentController) ImportJSON(context *fiber.Ctx) error {
	filePath := context.Query("file")
	if filePath == "" {
		return context.Status(400).JSON(fiber.Map{"error": "file parameter required"})
	}

	err := util.ImportDepartmentsFromJSON(filePath, controller.application)
	if err != nil {
		return context.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return context.JSON(fiber.Map{"message": "Departments imported successfully from JSON"})
}

func NewDepartmentController() *DepartmentController {
	controller := &DepartmentController{}
	return controller
}

func (controller *DepartmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *DepartmentController) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "common", "view", "Department.tpl")
	template, _ := mustache.ParseFile(path)
	rendered := template.Render(map[string]string{
		"title":   "ModEd Department Form",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *DepartmentController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var departments []*model.Department
	result := controller.application.DB.Find(&departments)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validDepartments := []*model.Department{}
	for _, d := range departments {
		if err := d.Validate(); err == nil {
			validDepartments = append(validDepartments, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validDepartments,
	})
}

func (controller *DepartmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/getinfo",
		Handler: controller.GetInfo,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/getall",
		Handler: controller.GetAllDepartments,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/:id",
		Handler: controller.GetDepartment,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments",
		Handler: controller.CreateDepartment,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/:id",
		Handler: controller.UpdateDepartment,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/delete/:id",
		Handler: controller.DeleteDepartment,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/departments/import/json",
		Handler: controller.ImportJSON,
		Method:  core.GET,
	})
	return routeList
}

func (controller *DepartmentController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "common/departments",
		Model: &model.Department{},
	})
	return modelMetaList
}
