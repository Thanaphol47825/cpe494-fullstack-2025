package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
)

type ApplicationReportController struct {
	application *core.ModEdApplication
}

func NewApplicationReportController() *ApplicationReportController {
	controller := &ApplicationReportController{}
	return controller
}

func (controller *ApplicationReportController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *ApplicationReportController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

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
		Route:   "/recruit/UpdateApplicationReport/:id",
		Handler: controller.UpdateApplicationReport,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteApplicationReport/:id",
		Handler: controller.DeleteApplicationReport,
		Method:  core.POST,
	})

	return routeList
}

func (controller *ApplicationReportController) CreateApplicationReport(context *fiber.Ctx) error {
	applicationReport := new(model.ApplicationReport)

	if err := context.BodyParser(applicationReport); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(applicationReport).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicationReport,
	})
}

func (controller *ApplicationReportController) GetAllApplicationReports(context *fiber.Ctx) error {
	var applicationReports []*model.ApplicationReport

	if err := controller.application.DB.Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		Find(&applicationReports).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicationReports,
	})
}

func (controller *ApplicationReportController) GetApplicationReportByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var applicationReport model.ApplicationReport

	if err := controller.application.DB.Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		First(&applicationReport, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "ApplicationReport not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicationReport,
	})
}

func (controller *ApplicationReportController) UpdateApplicationReport(context *fiber.Ctx) error {
	id := context.Params("id")
	var existingApplicationReport model.ApplicationReport

	if err := controller.application.DB.First(&existingApplicationReport, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "ApplicationReport not found",
		})
	}

	var updateData model.ApplicationReport
	if err := context.BodyParser(&updateData); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if updateData.ApplicantID != 0 {
		existingApplicationReport.ApplicantID = updateData.ApplicantID
	}
	if updateData.ApplicationRoundsID != 0 {
		existingApplicationReport.ApplicationRoundsID = updateData.ApplicationRoundsID
	}
	if updateData.FacultyID != 0 {
		existingApplicationReport.FacultyID = updateData.FacultyID
	}
	if updateData.DepartmentID != 0 {
		existingApplicationReport.DepartmentID = updateData.DepartmentID
	}
	if updateData.Program != nil {
		existingApplicationReport.Program = updateData.Program
	}
	if updateData.ApplicationStatuses != "" {
		existingApplicationReport.ApplicationStatuses = updateData.ApplicationStatuses
	}

	if err := controller.application.DB.Save(&existingApplicationReport).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existingApplicationReport,
	})
}

func (controller *ApplicationReportController) DeleteApplicationReport(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.ApplicationReport{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "ApplicationReport deleted successfully",
	})
}
