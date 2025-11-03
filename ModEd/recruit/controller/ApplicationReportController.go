package controller

import (
	commonModel "ModEd/common/model"
	"ModEd/core"
	"ModEd/recruit/model"
	"fmt"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type ApplicationReportController struct {
	application *core.ModEdApplication
}

func NewApplicationReportController() *ApplicationReportController {
	return &ApplicationReportController{}
}

func (controller *ApplicationReportController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{
		{
			Path:  "recruit/applicationreport",
			Model: &model.ApplicationReport{},
		},
	}
	return modelMetaList
}

func (controller *ApplicationReportController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *ApplicationReportController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "ApplicationReportCreate.tpl")

	rendered := mustache.RenderFile(path, map[string]any{
		"title":   "Create Application Report",
		"RootURL": controller.application.RootURL,
	})

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (controller *ApplicationReportController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/RenderCreateForm",
		Handler: controller.RenderCreateForm,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateApplicationReport",
		Handler: controller.CreateApplicationReport,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationReports",
		Handler: controller.GetAllApplicationReports,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationReport/:id",
		Handler: controller.GetApplicationReportByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateApplicationReport",
		Handler: controller.UpdateApplicationReport,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteApplicationReport",
		Handler: controller.DeleteApplicationReport,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationReportsFromFile",
		Handler: controller.GetApplicationReportsFromFile,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationReportByApplicant/:applicantId",
		Handler: controller.GetApplicationReportByApplicant,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/VerifyApplicationEligibility",
		Handler: controller.VerifyApplicationEligibility,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetFacultyOptions",
		Handler: controller.GetFacultyOptions,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetDepartmentOptions",
		Handler: controller.GetDepartmentOptions,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetProgramTypeOptions",
		Handler: controller.GetProgramTypeOptions,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/TransferConfirmedApplicants",
		Handler: controller.TransferConfirmedApplicantsHandler,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/TransferConfirmedApplicantByID",
		Handler: controller.TransferConfirmedApplicantByIDHandler,
		Method:  core.POST,
	})

	return routeList
}

func (controller *ApplicationReportController) CreateApplicationReport(c *fiber.Ctx) error {
	report := new(model.ApplicationReport)
	fmt.Println("RAW BODY:", string(c.Body()))
	if err := c.BodyParser(report); err != nil {
		fmt.Println("PARSE ERROR:", err)
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: fmt.Sprintf("Cannot parse JSON: %v", err),
		})
	}

	fmt.Printf("PARSED REPORT: %+v\n", report)

	if err := controller.application.DB.Create(report).Error; err != nil {
		fmt.Println("DB CREATE ERROR:", err)
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: report,
	})
}

func (controller *ApplicationReportController) GetAllApplicationReports(c *fiber.Ctx) error {
	var reports []*model.ApplicationReport

	if err := controller.application.DB.
		Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		Find(&reports).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: reports,
	})
}

func (controller *ApplicationReportController) GetApplicationReportByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var report model.ApplicationReport

	if err := controller.application.DB.
		Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		First(&report, id).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: "ApplicationReport not found",
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: report,
	})
}

func (controller *ApplicationReportController) UpdateApplicationReport(c *fiber.Ctx) error {
	report := new(model.ApplicationReport)
	if err := c.BodyParser(report); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Cannot parse JSON",
		})
	}

	if report.ID == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Missing ID",
		})
	}

	var existing model.ApplicationReport
	if err := controller.application.DB.First(&existing, report.ID).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: "ApplicationReport not found",
		})
	}

	updateData := map[string]interface{}{
		"applicant_id":          report.ApplicantID,
		"application_rounds_id": report.ApplicationRoundsID,
		"faculty_id":            report.FacultyID,
		"department_id":         report.DepartmentID,
		"program":               report.Program,
	}

	if report.ApplicationStatuses != "" {
		updateData["application_statuses"] = report.ApplicationStatuses
	}

	if err := controller.application.DB.Model(&existing).Updates(updateData).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: existing,
	})
}

func (controller *ApplicationReportController) DeleteApplicationReport(c *fiber.Ctx) error {
	var payload struct {
		ID uint `json:"id"`
	}

	if err := c.BodyParser(&payload); err != nil || payload.ID == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Invalid ID",
		})
	}

	if err := controller.application.DB.Where("id = ?", payload.ID).Delete(&model.ApplicationReport{}).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Message: "Delete successful",
	})
}

func (controller *ApplicationReportController) ReadApplicationReportsFromFile(filePath string) ([]*model.ApplicationReport, error) {
	mapper, err := core.CreateMapper[model.ApplicationReport](filePath)
	if err != nil {
		return nil, err
	}
	return mapper.Deserialize(), nil
}

func (controller *ApplicationReportController) GetApplicationReportsFromFile(c *fiber.Ctx) error {
	filePath := c.Query("path")
	if filePath == "" {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "File path is required",
		})
	}

	reports, err := controller.ReadApplicationReportsFromFile(filePath)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: reports,
	})
}

func (controller *ApplicationReportController) GetApplicationReportByApplicant(c *fiber.Ctx) error {
	applicantParam := c.Params("applicantId")
	id, err := strconv.Atoi(applicantParam)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusBadRequest,
			Message:   "Invalid applicantId",
		})
	}

	var reports []model.ApplicationReport
	if err := controller.application.DB.
		Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		Where("applicant_id = ?", id).
		Find(&reports).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	if len(reports) == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusNotFound,
			Message:   "No ApplicationReport found for this applicant",
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Result:    reports,
	})
}

func (controller *ApplicationReportController) VerifyApplicationEligibility(c *fiber.Ctx) error {
	var payload struct {
		ApplicantID uint `json:"applicantId"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Invalid request payload",
		})
	}

	status := "Eligible"

	if err := controller.application.DB.Model(&model.ApplicationReport{}).
		Where("applicant_id = ?", payload.ApplicantID).
		Update("application_statuses", status).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Message: "Eligibility check complete",
	})
}

func (controller *ApplicationReportController) GetFacultyOptions(c *fiber.Ctx) error {
	var faculties []commonModel.Faculty

	if err := controller.application.DB.Find(&faculties).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	type Option struct {
		Label string `json:"label"`
		Value uint   `json:"value"`
	}

	options := make([]Option, 0, len(faculties))
	for _, faculty := range faculties {
		options = append(options, Option{
			Label: faculty.Name,
			Value: faculty.ID,
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Result:    options,
	})
}

func (controller *ApplicationReportController) GetDepartmentOptions(c *fiber.Ctx) error {
	var departments []commonModel.Department

	if err := controller.application.DB.Find(&departments).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	type Option struct {
		Label string `json:"label"`
		Value uint   `json:"value"`
	}

	options := make([]Option, 0, len(departments))
	for _, dept := range departments {
		options = append(options, Option{
			Label: dept.Name,
			Value: dept.ID,
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Result:    options,
	})
}

func (controller *ApplicationReportController) GetProgramTypeOptions(c *fiber.Ctx) error {
	programTypes := []commonModel.ProgramType{
		commonModel.REGULAR,
		commonModel.INTERNATIONAL,
	}

	var results []map[string]interface{}
	for _, program := range programTypes {
		results = append(results, map[string]interface{}{
			"value": program,
			"label": commonModel.ProgramTypeLabel[program],
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    results,
	})
}

func (controller *ApplicationReportController) generateStudentCode(program string, year int) (string, error) {
	const facultyCode = "0705"

	if year == 0 {
		year = time.Now().Year()
	}

	buddhistYear := (year + 543) % 100

	var programCode string
	switch program {
	case commonModel.ProgramTypeLabel[commonModel.REGULAR]:
		programCode = "01"
	case commonModel.ProgramTypeLabel[commonModel.INTERNATIONAL]:
		programCode = "34"
	default:
		programCode = "72"
	}

	prefix := fmt.Sprintf("%02d%s%s", buddhistYear, facultyCode, programCode)

	var lastStudent commonModel.Student
	err := controller.application.DB.
		Where("student_code LIKE ?", prefix+"%").
		Order("student_code DESC").
		First(&lastStudent).Error

	running := 1
	if err == nil && len(lastStudent.StudentCode) > len(prefix) {
		numStr := lastStudent.StudentCode[len(prefix):]
		if n, convErr := strconv.Atoi(numStr); convErr == nil {
			running = n + 1
		}
	}

	studentCode := fmt.Sprintf("%s%03d", prefix, running)
	return studentCode, nil
}

func (controller *ApplicationReportController) TransferConfirmedApplicantsHandler(c *fiber.Ctx) error {
	var reports []model.ApplicationReport

	if err := controller.application.DB.
		Preload("Applicant").
		Preload("Department").
		Where("application_statuses = ?", model.Confirmed).
		Find(&reports).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   fmt.Sprintf("Failed to retrieve confirmed applications: %v", err),
		})
	}

	if len(reports) == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusOK,
			Message:   "No confirmed applicants found.",
		})
	}

	activeStatus := commonModel.ACTIVE
	var createdCount int

	for _, report := range reports {
		applicant := report.Applicant
		if applicant.ID == 0 {
			continue
		}

		studentCode, err := controller.generateStudentCode(report.Program.String(), time.Now().Year())
		if err != nil {
			continue
		}

		var existing commonModel.Student
		if err := controller.application.DB.Where("student_code = ?", studentCode).First(&existing).Error; err == nil {
			continue
		}

		student := commonModel.Student{
			StudentCode: studentCode,
			FirstName:   applicant.FirstName,
			LastName:    applicant.LastName,
			Email:       applicant.Email,
			StartDate:   time.Now(),
			BirthDate:   applicant.BirthDate,
			Program:     commonModel.ProgramType(report.Program),
			Department:  report.Department.Name,
			Status:      &activeStatus,
		}

		if err := controller.application.DB.Create(&student).Error; err != nil {
			continue
		}

		if err := controller.application.DB.Model(&report).Update("application_statuses", model.Student).Error; err != nil {
			continue
		}

		createdCount++
	}

	if createdCount == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusOK,
			Message:   "No new students were created. All confirmed applicants already transferred.",
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   fmt.Sprintf("✅ Transfer completed successfully — %d applicants converted to students.", createdCount),
	})
}

func (controller *ApplicationReportController) TransferConfirmedApplicantByIDHandler(c *fiber.Ctx) error {
	var payload struct {
		ApplicantID uint `json:"applicant_id"`
	}

	if err := c.BodyParser(&payload); err != nil || payload.ApplicantID == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusBadRequest,
			Message:   "Invalid or missing applicant_id",
		})
	}

	var report model.ApplicationReport
	if err := controller.application.DB.
		Preload("Applicant").
		Preload("Department").
		Where("applicant_id = ? AND application_statuses = ?", payload.ApplicantID, model.Confirmed).
		First(&report).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusNotFound,
			Message:   "Confirmed applicant not found or not eligible for transfer",
		})
	}

	activeStatus := commonModel.ACTIVE

	studentCode, err := controller.generateStudentCode(report.Program.String(), time.Now().Year())
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   fmt.Sprintf("Failed to generate student code: %v", err),
		})
	}

	student := commonModel.Student{
		StudentCode: studentCode,
		FirstName:   report.Applicant.FirstName,
		LastName:    report.Applicant.LastName,
		Email:       report.Applicant.Email,
		StartDate:   time.Now(),
		BirthDate:   report.Applicant.BirthDate,
		Program:     report.Program,
		Department:  report.Department.Name,
		Status:      &activeStatus,
	}

	if err := controller.application.DB.Create(&student).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   fmt.Sprintf("Failed to create student: %v", err),
		})
	}

	if err := controller.application.DB.Model(&report).Update("application_statuses", model.Student).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   fmt.Sprintf("Failed to update report status: %v", err),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   fmt.Sprintf("✅ Applicant #%d transferred successfully to student record (%s).", payload.ApplicantID, studentCode),
	})
}
