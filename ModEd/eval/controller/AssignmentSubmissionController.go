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

type AssignmentSubmissionController struct {
	application *core.ModEdApplication
}

func NewAssignmentSubmissionController() *AssignmentSubmissionController {
	controller := &AssignmentSubmissionController{}
	return controller
}

func (controller *AssignmentSubmissionController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/assignmentsubmission", Model: &model.AssignmentSubmission{}},
	}
}

func (controller *AssignmentSubmissionController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentSubmissionController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/create",
		Handler: controller.CreateSubmission,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/getAll",
		Handler: controller.GetAllSubmissions,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/getByAssignment/:assignmentId",
		Handler: controller.GetSubmissionsByAssignment,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/get/:id",
		Handler: controller.GetSubmissionByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/files/:id",
		Handler: controller.GetSubmissionFiles,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission/delete/:id",
		Handler: controller.DeleteSubmission,
		Method:  core.POST,
	})

	return routeList
}

// Create new assignment submission
func (controller *AssignmentSubmissionController) CreateSubmission(context *fiber.Ctx) error {
	var submission model.AssignmentSubmission

	// Support multipart/form-data with 'data' JSON and files
	if form, err := context.MultipartForm(); err == nil && form != nil {
		// parse JSON payload from form value 'data'
		if vals, ok := form.Value["data"]; ok && len(vals) > 0 {
			if err := json.Unmarshal([]byte(vals[0]), &submission); err != nil {
				return context.JSON(fiber.Map{"isSuccess": false, "result": "cannot parse data JSON"})
			}
		}

		// Set submitted time
		submission.SubmittedAt = time.Now()

		// Check if submission is late (compare with assignment due date)
		var assignment model.Assignment
		if err := controller.application.DB.First(&assignment, submission.AssignmentID).Error; err == nil {
			submission.IsLate = time.Now().After(assignment.DueDate)
		}

		// create submission record first to get ID for file naming
		if err := controller.application.DB.Create(&submission).Error; err != nil {
			return context.JSON(fiber.Map{"isSuccess": false, "result": err.Error()})
		}

		// save uploaded files (field name 'files')
		files := form.File["files"]
		var filePaths []string
		if len(files) > 0 {
			saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-submit")
			if err := os.MkdirAll(saveDir, 0755); err != nil {
				fmt.Println("cannot create save dir:", err)
			}
			for _, fh := range files {
				// create unique filename: {submissionID}_{timestamp}_{originalFilename}
				fname := fmt.Sprintf("%d_%d_%s", submission.ID, time.Now().UnixNano(), fh.Filename)
				savePath := filepath.Join(saveDir, fname)
				if err := context.SaveFile(fh, savePath); err != nil {
					fmt.Println("failed to save file:", err)
				} else {
					filePaths = append(filePaths, fname)
				}
			}
		}

		// Store file paths in AttachmentPath (comma-separated)
		if len(filePaths) > 0 {
			submission.AttachmentPath = strings.Join(filePaths, ",")
			controller.application.DB.Model(&submission).Update("attachment_path", submission.AttachmentPath)
		}

		return context.JSON(fiber.Map{"isSuccess": true, "result": submission})
	}

	// fallback: parse JSON body
	if err := context.BodyParser(&submission); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	submission.SubmittedAt = time.Now()

	if err := controller.application.DB.Create(&submission).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submission,
	})
}

// Get all submissions (for admin/manage view)
func (controller *AssignmentSubmissionController) GetAllSubmissions(context *fiber.Ctx) error {
	var submissions []model.AssignmentSubmission

	if err := controller.application.DB.Find(&submissions).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submissions,
	})
}

// Get submissions by assignment ID
func (controller *AssignmentSubmissionController) GetSubmissionsByAssignment(context *fiber.Ctx) error {
	assignmentId := context.Params("assignmentId")
	var submissions []model.AssignmentSubmission

	if err := controller.application.DB.Where("assignment_id = ?", assignmentId).Find(&submissions).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submissions,
	})
}

// Get submission by ID
func (controller *AssignmentSubmissionController) GetSubmissionByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var submission model.AssignmentSubmission

	if err := controller.application.DB.First(&submission, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Submission not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submission,
	})
}

// Get submission files by submission ID
func (controller *AssignmentSubmissionController) GetSubmissionFiles(context *fiber.Ctx) error {
	id := context.Params("id")
	var submission model.AssignmentSubmission

	if err := controller.application.DB.First(&submission, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Submission not found",
		})
	}

	if submission.AttachmentPath == "" {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    []map[string]string{},
		})
	}

	// Parse comma-separated file paths
	fileNames := strings.Split(submission.AttachmentPath, ",")
	var fileList []map[string]string
	saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-submit")

	for _, filename := range fileNames {
		filename = strings.TrimSpace(filename)
		if filename == "" {
			continue
		}

		// Check if file exists
		filePath := filepath.Join(saveDir, filename)
		if _, err := os.Stat(filePath); err == nil {
			// Extract original filename: {submissionID}_{timestamp}_{originalFilename}
			parts := strings.SplitN(filename, "_", 3)
			originalName := filename
			if len(parts) >= 3 {
				originalName = parts[2]
			}

			fileList = append(fileList, map[string]string{
				"filename": filename,
				"original": originalName,
				"url":      fmt.Sprintf("/eval/static/assignment-submit/%s", filename),
			})
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    fileList,
	})
}

// Delete submission by ID
func (controller *AssignmentSubmissionController) DeleteSubmission(context *fiber.Ctx) error {
	id := context.Params("id")

	// Get submission to retrieve file paths before deletion
	var submission model.AssignmentSubmission
	if err := controller.application.DB.First(&submission, id).Error; err == nil {
		// Delete associated files
		if submission.AttachmentPath != "" {
			saveDir := filepath.Join(controller.application.RootPath, "eval", "static", "assignment-submit")
			fileNames := strings.Split(submission.AttachmentPath, ",")
			for _, filename := range fileNames {
				filename = strings.TrimSpace(filename)
				if filename == "" {
					continue
				}
				filePath := filepath.Join(saveDir, filename)
				if err := os.Remove(filePath); err != nil {
					fmt.Printf("Warning: Failed to delete file %s: %v\n", filename, err)
				} else {
					fmt.Printf("Deleted file: %s\n", filename)
				}
			}
		}
	}

	// Delete submission from database
	if err := controller.application.DB.Delete(&model.AssignmentSubmission{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Submission and associated files deleted successfully",
	})
}
