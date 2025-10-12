package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

	"github.com/gofiber/fiber/v2"
)

type InternCertificateController struct {
	application *core.ModEdApplication
	handler     *handler.InternCertificateHandler
}

func NewInternCertificateController(app *core.ModEdApplication) *InternCertificateController {
	controller := &InternCertificateController{
		application: app,
		handler:     handler.NewInternCertificateHandler(app),
	}
	return controller
}
func (controller *InternCertificateController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello InternCertificate")
}

func (controller *InternCertificateController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternCertificateRenderMain",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternCertificate/:id?",
		Handler: controller.handler.GetInternCertificate,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternCertificate",
		Handler: controller.handler.CreateInternCertificate,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternCertificateRender",
		Handler: controller.handler.CreateInternCertificateRender,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternCertificate/:id",
		Handler: controller.handler.UpdateInternCertificate,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternCertificate/:id",
		Handler: controller.handler.DeleteInternCertificate,
		Method:  core.POST,
	})
	return routeList
}

func (controller *InternCertificateController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InternCertificateController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
