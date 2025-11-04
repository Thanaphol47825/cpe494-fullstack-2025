package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/files/:id",
		Handler: controller.GetAssignmentFiles,
		Method:  core.GET,
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

	// Add computed Active field and file list to each assignment
	now := time.Now()
	result := make([]map[string]interface{}, len(assignments))
	for i, assignment := range assignments {
		result[i] = map[string]interface{}{
			"ID":          assignment.ID,
			"title":       assignment.Title,
			"description": assignment.Description,
			"dueDate":     assignment.DueDate,
			"startDate":   assignment.StartDate,
			"maxScore":    assignment.MaxScore,
			"createdAt":   assignment.CreatedAt,
			"updatedAt":   assignment.UpdatedAt,
			"active":      now.After(assignment.StartDate) && now.Before(assignment.DueDate),
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
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

	// Return in same format as GetAllAssignments
	now := time.Now()
	result := map[string]interface{}{
		"ID":          assignment.ID,
		"title":       assignment.Title,
		"description": assignment.Description,
		"dueDate":     assignment.DueDate,
		"startDate":   assignment.StartDate,
		"maxScore":    assignment.MaxScore,
		"createdAt":   assignment.CreatedAt,
		"updatedAt":   assignment.UpdatedAt,
		"active":      now.After(assignment.StartDate) && now.Before(assignment.DueDate),
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

// Update existing assignment
func (controller *AssignmentController) UpdateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	// Support multipart/form-data with 'data' JSON and files (for edit with file upload)
	if form, err := context.MultipartForm(); err == nil && form != nil {
		// parse JSON payload from form value 'data'
		if vals, ok := form.Value["data"]; ok && len(vals) > 0 {
			if err := json.Unmarshal([]byte(vals[0]), &assignment); err != nil {
				return context.JSON(fiber.Map{"isSuccess": false, "result": "cannot parse data JSON"})
			}
		}

		// update assignment record
		if err := controller.application.DB.Model(&model.Assignment{}).Where("id = ?", assignment.ID).Updates(&assignment).Error; err != nil {
			return context.JSON(fiber.Map{"isSuccess": false, "result": err.Error()})
		}

		// save uploaded files (field name 'files')
		files := form.File["files"]
		if len(files) > 0 {
			saveDir := filepath.Join(controller.application.RootPath, "ModEd", "eval", "static", "assignment-file")
			if err := os.MkdirAll(saveDir, 0755); err != nil {
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

	if err := controller.application.DB.Model(&model.Assignment{}).Where("id = ?", assignment.ID).Updates(&assignment).Error; err != nil {
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

// Get assignment files by assignment ID
func (controller *AssignmentController) GetAssignmentFiles(context *fiber.Ctx) error {
	id := context.Params("id")
	saveDir := filepath.Join(controller.application.RootPath, "ModEd", "eval", "static", "assignment-file")

	// Read directory to find files matching the assignment ID pattern
	files, err := os.ReadDir(saveDir)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "No files directory found",
		})
	}

	var fileList []map[string]string
	for _, file := range files {
		if !file.IsDir() {
			// Check if file starts with assignment ID
			filename := file.Name()
			if len(filename) > 0 {
				// Pattern: {assignmentID}_{timestamp}_{originalFilename}
				parts := strings.SplitN(filename, "_", 3)
				if len(parts) >= 3 && parts[0] == id {
					fileList = append(fileList, map[string]string{
						"filename": filename,
						"original": parts[2],
						"url":      fmt.Sprintf("/eval/static/assignment-file/%s", filename),
					})
				}
			}
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fileList,
	})
}
