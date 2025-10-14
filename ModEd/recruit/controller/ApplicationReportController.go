package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"fmt"
	"path/filepath"
	"strconv"

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

	return routeList
}

func (controller *ApplicationReportController) CreateApplicationReport(c *fiber.Ctx) error {
	report := new(model.ApplicationReport)
	fmt.Println("RAW BODY:", string(c.Body()))
	if err := c.BodyParser(report); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(report).Error; err != nil {
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
