package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipEvaluationController struct {
	application *core.ModEdApplication
}

func NewInternshipEvaluationController() *InternshipEvaluationController {
	controller := &InternshipEvaluationController{}
	return controller
}
func (controller *InternshipEvaluationController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello /curriculum/InternshipEvaludation")
}

func (controller *InternshipEvaluationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipEvaluation",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipEvaluationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipEvaluationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
