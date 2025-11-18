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

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/user/role",
		Handler: controller.GetCurrentUserRole,
		Method:  core.GET,
		Authentication: core.Authentication{
			AuthType: core.AuthAny,
		},
	})

	return routeList
}

// Create new assignment
func (controller *AssignmentController) CreateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	// Support multipart/form-data with 'data' JSON and files
	if form, err := context.MultipartForm(); err == nil && form != nil {
		fmt.Printf("Multipart form received. Files in form: %d\n", len(form.File))
		// parse JSON payload from form value 'data'
		if vals, ok := form.Value["data"]; ok && len(vals) > 0 {
			if err := json.Unmarshal([]byte(vals[0]), &assignment); err != nil {
				return context.JSON(fiber.Map{"isSuccess": false, "result": "cannot parse data JSON: " + err.Error()})
			}
		} else {
			return context.JSON(fiber.Map{"isSuccess": false, "result": "missing 'data' field in form"})
		}

		// Validate required fields
		if assignment.CourseId == 0 {
			return context.JSON(fiber.Map{"isSuccess": false, "result": "courseId is required"})
		}

		// create assignment record first to get ID for file naming
		if err := controller.application.DB.Create(&assignment).Error; err != nil {
			return context.JSON(fiber.Map{"isSuccess": false, "result": "database error: " + err.Error()})
		}
		fmt.Printf("Assignment created with ID: %d\n", assignment.ID)

		// save uploaded files (field name 'files')
		files := form.File["files"]
		fmt.Printf("Number of files in 'files' field: %d\n", len(files))
		if len(files) > 0 {
			// RootPath is already /workspace/ModEd, so don't add "ModEd" again
			saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-file")
			fmt.Printf("RootPath: %s\n", controller.application.RootPath)
			fmt.Printf("Saving files to directory: %s\n", saveDir)
			if err := os.MkdirAll(saveDir, 0755); err != nil {
				fmt.Printf("ERROR: cannot create save dir: %v\n", err)
				return context.JSON(fiber.Map{"isSuccess": false, "result": "Failed to create save directory: " + err.Error()})
			}
			for _, fh := range files {
				// create unique filename
				fname := fmt.Sprintf("%d_%d_%s", assignment.ID, time.Now().UnixNano(), fh.Filename)
				savePath := filepath.Join(saveDir, fname)
				fmt.Printf("Saving file: %s -> %s\n", fh.Filename, savePath)
				if err := context.SaveFile(fh, savePath); err != nil {
					fmt.Printf("ERROR: failed to save file %s: %v\n", fh.Filename, err)
					return context.JSON(fiber.Map{"isSuccess": false, "result": "Failed to save file: " + err.Error()})
				}
				fmt.Printf("SUCCESS: File saved to %s\n", savePath)
			}
		}

		return context.JSON(fiber.Map{"isSuccess": true, "result": assignment})
	}

	// fallback: parse JSON body
	if err := context.BodyParser(&assignment); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON: " + err.Error(),
		})
	}

	// Validate required fields
	if assignment.CourseId == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "courseId is required",
		})
	}

	if err := controller.application.DB.Create(&assignment).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "database error: " + err.Error(),
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

	// Support filtering by courseId (query parameter)
	query := controller.application.DB
	if courseId := context.Query("courseId"); courseId != "" {
		query = query.Where("course_id = ?", courseId)
	}

	if err := query.Find(&assignments).Error; err != nil {
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
			"courseId":    assignment.CourseId,
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
			saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-file")
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

	// Delete associated files first
	saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-file")
	files, err := os.ReadDir(saveDir)
	if err == nil {
		for _, file := range files {
			if !file.IsDir() {
				filename := file.Name()
				// Check if file belongs to this assignment (pattern: {assignmentID}_{timestamp}_{originalFilename})
				parts := strings.SplitN(filename, "_", 3)
				if len(parts) >= 3 && parts[0] == id {
					filePath := filepath.Join(saveDir, filename)
					if err := os.Remove(filePath); err != nil {
						fmt.Printf("Warning: Failed to delete file %s: %v\n", filename, err)
					} else {
						fmt.Printf("Deleted file: %s\n", filename)
					}
				}
			}
		}
	}

	// Delete assignment from database
	if err := controller.application.DB.Delete(&model.Assignment{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Assignment and associated files deleted successfully",
	})
}

// Get assignment files by assignment ID
func (controller *AssignmentController) GetAssignmentFiles(context *fiber.Ctx) error {
	id := context.Params("id")
	saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-file")
	fmt.Printf("GetAssignmentFiles: Looking for files with assignment ID: %s\n", id)
	fmt.Printf("GetAssignmentFiles: Searching in directory: %s\n", saveDir)

	// Read directory to find files matching the assignment ID pattern
	files, err := os.ReadDir(saveDir)
	if err != nil {
		fmt.Printf("GetAssignmentFiles: Error reading directory: %v\n", err)
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "No files directory found: " + err.Error(),
		})
	}

	fmt.Printf("GetAssignmentFiles: Found %d items in directory\n", len(files))
	var fileList []map[string]string
	for _, file := range files {
		if !file.IsDir() {
			// Check if file starts with assignment ID
			filename := file.Name()
			fmt.Printf("GetAssignmentFiles: Checking file: %s\n", filename)
			if len(filename) > 0 {
				// Pattern: {assignmentID}_{timestamp}_{originalFilename}
				parts := strings.SplitN(filename, "_", 3)
				fmt.Printf("GetAssignmentFiles: File parts: %v (looking for ID: %s)\n", parts, id)
				if len(parts) >= 3 && parts[0] == id {
					fileList = append(fileList, map[string]string{
						"filename": filename,
						"original": parts[2],
						"url":      fmt.Sprintf("/eval/static/assignment-file/%s", filename),
					})
					fmt.Printf("GetAssignmentFiles: Matched file: %s\n", filename)
				}
			}
		}
	}
	fmt.Printf("GetAssignmentFiles: Returning %d files\n", len(fileList))

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fileList,
	})
}

// GetCurrentUserRole - Get the current user's role
// Note: Returns default instructor view if authentication is not implemented
func (controller *AssignmentController) GetCurrentUserRole(context *fiber.Ctx) error {
	// Get user ID from context (set by RBAC middleware)
	userIDInterface := context.Locals("userId")
	if userIDInterface == nil {
		// Authentication not implemented - return default instructor view
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result": map[string]interface{}{
				"userId":    nil,
				"roles":     []string{},
				"isTeacher": true, // Default to instructor view
				"isStudent": false,
			},
		})
	}

	userID := fmt.Sprintf("%v", userIDInterface)

	// Check user roles from user_roles table
	var roles []string
	var userRoles []struct {
		Role string `gorm:"column:role"`
	}

	if err := controller.application.DB.Table("user_roles").
		Select("role").
		Where("user_id = ?", userID).
		Find(&userRoles).Error; err != nil {
		// If no roles found, return empty array
		roles = []string{}
	} else {
		for _, ur := range userRoles {
			roles = append(roles, ur.Role)
		}
	}

	// Determine if user is teacher/instructor or student
	isTeacher := false
	for _, role := range roles {
		if role == "teacher" || role == "instructor" || role == "professor" {
			isTeacher = true
			break
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result": map[string]interface{}{
			"userId":    userID,
			"roles":     roles,
			"isTeacher": isTeacher,
			"isStudent": !isTeacher && len(roles) > 0, // If has roles but not teacher, assume student
		},
	})
}
