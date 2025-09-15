package controller

import (
	"ModEd/common/model"
	"ModEd/common/util"
	"ModEd/core"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (controller *StudentController) RenderCreateForm(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "common", "view", "Student.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Add New Student",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")
	return context.SendString(rendered)
}

func (controller *StudentController) GetAllStudents(context *fiber.Ctx) error {
	var students []model.Student
	result := controller.application.DB.Find(&students)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    students,
	})
}

func (controller *StudentController) GetStudent(context *fiber.Ctx) error {
	id := context.Params("id")
	var student model.Student
	result := controller.application.DB.First(&student, id)

	if result.Error != nil {
		return context.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Student not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    student,
	})
}

func (controller *StudentController) CreateStudent(context *fiber.Ctx) error {
	var student model.Student
	if err := context.BodyParser(&student); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	result := controller.application.DB.Create(&student)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	return context.Status(201).JSON(fiber.Map{
		"isSuccess": true,
		"result":    student,
	})
}

func (controller *StudentController) UpdateStudent(context *fiber.Ctx) error {
	id := context.Params("id")
	var student model.Student

	if err := controller.application.DB.First(&student, id).Error; err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Student not found",
		})
	}

	if err := context.BodyParser(&student); err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "Invalid JSON",
		})
	}

	studentID, _ := strconv.Atoi(id)
	student.ID = uint(studentID)
	controller.application.DB.Save(&student)

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    student,
	})
}

func (controller *StudentController) DeleteStudent(context *fiber.Ctx) error {
	id := context.Params("id")
	result := controller.application.DB.Delete(&model.Student{}, id)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fmt.Sprintf("Student %s deleted", id),
	})
}

func NewStudentController() *StudentController {
	controller := &StudentController{}
	return controller
}

func (controller *StudentController) ImportJSON(context *fiber.Ctx) error {
	filePath := context.Query("file")
	if filePath == "" {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "file parameter required",
		})
	}

	err := util.ImportStudentsFromJSON(filePath, controller.application)
	if err != nil {
		return context.Status(400).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "file parameter required",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Students imported successfully from JSON",
	})
}

func (controller *StudentController) RenderMain(context *fiber.Ctx) error {
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Hello common/Student",
	})
}

func (controller *StudentController) GetInfo(context *fiber.Ctx) error {
	fmt.Printf("%s\n", string(context.Request().Body()))

	var students []*model.Student
	result := controller.application.DB.Find(&students)
	if result.Error != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"error":     result.Error.Error(),
		})
	}

	validStudents := []*model.Student{}
	for _, d := range students {
		if err := d.Validate(); err == nil {
			validStudents = append(validStudents, d)
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    validStudents,
	})
}

func (controller *StudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/create",
		Handler: controller.RenderCreateForm,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/getinfo",
		Handler: controller.GetInfo,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/getall",
		Handler: controller.GetAllStudents,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/:id",
		Handler: controller.GetStudent,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students",
		Handler: controller.CreateStudent,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/:id",
		Handler: controller.UpdateStudent,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/delete/:id",
		Handler: controller.DeleteStudent,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "common/students/import/json",
		Handler: controller.ImportJSON,
		Method:  core.GET,
	})
	return routeList
}

func (controller *StudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
