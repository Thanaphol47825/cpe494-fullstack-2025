package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type InterviewController struct {
	application *core.ModEdApplication
}

func NewInterviewController() *InterviewController {
	controller := &InterviewController{}
	return controller
}

func (controller *InterviewController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InterviewController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *InterviewController) RenderInterviewCreate(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "InterviewCreate.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Template not found",
		})
	}

	rendered := template.Render(map[string]string{
		"title":   "Create Interview",
		"RootURL": controller.application.RootURL,
	})

	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InterviewController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/interview/create",
		Handler: controller.RenderInterviewCreate,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateInterview",
		Handler: controller.CreateInterview,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetInterviews",
		Handler: controller.GetAllInterviews,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetInterview/:id",
		Handler: controller.GetInterviewByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateInterview/:id",
		Handler: controller.UpdateInterview,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteInterview/:id",
		Handler: controller.DeleteInterview,
		Method:  core.POST,
	})

	return routeList
}

func (controller *InterviewController) CreateInterview(context *fiber.Ctx) error {
	interview := new(model.Interview)

	if err := context.BodyParser(interview); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(interview).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interview,
	})
}

func (controller *InterviewController) GetAllInterviews(context *fiber.Ctx) error {
	var interviews []*model.Interview

	if err := controller.application.DB.Preload("Instructor").
		Preload("ApplicationReport").
		Find(&interviews).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interviews,
	})
}

func (controller *InterviewController) GetInterviewByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var interview model.Interview

	if err := controller.application.DB.Preload("Instructor").
		Preload("ApplicationReport").
		First(&interview, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Interview not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interview,
	})
}

func (controller *InterviewController) UpdateInterview(context *fiber.Ctx) error {
	id := context.Params("id")
	var existingInterview model.Interview

	if err := controller.application.DB.First(&existingInterview, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Interview not found",
		})
	}

	var updateData model.Interview
	if err := context.BodyParser(&updateData); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if updateData.InstructorID != 0 {
		existingInterview.InstructorID = updateData.InstructorID
	}
	if updateData.ApplicationReportID != 0 {
		existingInterview.ApplicationReportID = updateData.ApplicationReportID
	}
	if !updateData.ScheduledAppointment.IsZero() {
		existingInterview.ScheduledAppointment = updateData.ScheduledAppointment
	}
	if updateData.CriteriaScores != "" {
		existingInterview.CriteriaScores = updateData.CriteriaScores
	}
	if updateData.TotalScore != 0 {
		existingInterview.TotalScore = updateData.TotalScore
	}
	if !updateData.EvaluatedAt.IsZero() {
		existingInterview.EvaluatedAt = updateData.EvaluatedAt
	}
	if updateData.InterviewStatus != "" {
		existingInterview.InterviewStatus = updateData.InterviewStatus
	}

	if err := controller.application.DB.Save(&existingInterview).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existingInterview,
	})
}

func (controller *InterviewController) DeleteInterview(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.Interview{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Interview deleted successfully",
	})
}
