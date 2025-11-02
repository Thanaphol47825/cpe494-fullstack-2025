package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
)

type ApplicationStatusController struct {
	application *core.ModEdApplication
}

func NewApplicationStatusController() *ApplicationStatusController {
	controller := &ApplicationStatusController{}
	return controller
}

func (controller *ApplicationStatusController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/ApplicationStatusController")
}

func (controller *ApplicationStatusController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ApplicationStatusController",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationStatusOptions",
		Handler: controller.GetApplicationStatusOptions,
		Method:  core.GET,
	})

	return routeList
}

func (controller *ApplicationStatusController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *ApplicationStatusController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *ApplicationStatusController) GetApplicationStatusOptions(context *fiber.Ctx) error {
	statuses := []model.ApplicationStatus{
		model.Pending,
		model.InterviewStage,
		model.Evaluated,
		model.Accepted,
		model.Rejected,
		model.Confirmed,
		model.Withdrawn,
		model.Student,
	}

	var results []map[string]interface{}
	for _, status := range statuses {
		results = append(results, map[string]interface{}{
			"value": string(status),
			"label": string(status),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    results,
	})
}
