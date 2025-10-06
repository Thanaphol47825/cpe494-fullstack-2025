package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

	"github.com/gofiber/fiber/v2"
)

type InternshipMentorController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipMentorHandler
}

func NewInternshipMentorController(app *core.ModEdApplication) *InternshipMentorController {
	controller := &InternshipMentorController{
		application: app,
		handler:     handler.NewInternshipMentorHandler(app),
	}
	return controller
}
func (controller *InternshipMentorController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello InternshipMentor")
}

func (controller *InternshipMentorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipMentorRenderMain",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipMentor/:id?",
		Handler: controller.handler.GetInternshipMentor,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipMentor",
		Handler: controller.handler.CreateInternshipMentor,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipMentorRender",
		Handler: controller.handler.CreateInternshipMentorRender,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipMentor/:id",
		Handler: controller.handler.UpdateInternshipMentor,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipMentor/:id",
		Handler: controller.handler.DeleteInternshipMentor,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternshipMentorController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternshipMentorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
