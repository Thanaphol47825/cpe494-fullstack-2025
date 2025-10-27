package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AssignmentController struct {
	application *core.ModEdApplication
}

func NewAssignmentController() *AssignmentController {
	controller := &AssignmentController{}
	return controller
}

func (controller *AssignmentController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/assignment", Model: model.Assignment{}},
	}
}

func (controller *AssignmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/create",
		Handler: controller.CreateAssignment,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/getAll",
		Handler: controller.GetAllAssignments,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/get/:id",
		Handler: controller.GetAssignmentByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/update",
		Handler: controller.UpdateAssignment,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/delete/:id",
		Handler: controller.DeleteAssignment,
		Method:  core.POST,
	})

	return routeList
}

// Create new assignment
func (controller *AssignmentController) CreateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	// Support multipart/form-data with 'data' JSON and files
	if form, err := context.MultipartForm(); err == nil && form != nil {
		// parse JSON payload from form value 'data'
		if vals, ok := form.Value["data"]; ok && len(vals) > 0 {
			if err := json.Unmarshal([]byte(vals[0]), &assignment); err != nil {
				return context.JSON(fiber.Map{"isSuccess": false, "result": "cannot parse data JSON"})
			}
		}

		// create assignment record first to get ID for file naming
		if err := controller.application.DB.Create(&assignment).Error; err != nil {
			return context.JSON(fiber.Map{"isSuccess": false, "result": err.Error()})
		}

		// save uploaded files (field name 'files')
		files := form.File["files"]
		if len(files) > 0 {
			saveDir := filepath.Join(controller.application.RootPath, "ModEd", "eval", "static", "assignment-file")
			if err := os.MkdirAll(saveDir, 0755); err != nil {
				// log but continue
				fmt.Println("cannot create save dir:", err)
			}
			for _, fh := range files {
				// create unique filename
				fname := fmt.Sprintf("%d_%d_%s", assignment.ID, time.Now().UnixNano(), fh.Filename)
				savePath := filepath.Join(saveDir, fname)
				if err := context.SaveFile(fh, savePath); err != nil {
					fmt.Println("failed to save file:", err)
				}
			}
		}

		return context.JSON(fiber.Map{"isSuccess": true, "result": assignment})
	}

	// fallback: parse JSON body
	if err := context.BodyParser(&assignment); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&assignment).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Get all assignments
func (controller *AssignmentController) GetAllAssignments(context *fiber.Ctx) error {
	var assignments []model.Assignment

	if err := controller.application.DB.Find(&assignments).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignments,
	})
}

// Get assignment by ID
func (controller *AssignmentController) GetAssignmentByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var assignment model.Assignment

	if err := controller.application.DB.First(&assignment, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Assignment not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Update existing assignment
func (controller *AssignmentController) UpdateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	if err := context.BodyParser(&assignment); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&assignment).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Delete assignment by ID
func (controller *AssignmentController) DeleteAssignment(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.Assignment{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Assignment deleted successfully",
	})
}
