package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

	"github.com/gofiber/fiber/v2"
)

type CertificateController struct {
	application *core.ModEdApplication
	handler     *handler.CertificateHandler
}

func NewCertificateController(app *core.ModEdApplication) *CertificateController {
	controller := &CertificateController{
		application: app,
		handler:     handler.NewCertificateHandler(app),
	}
	return controller
}
func (controller *CertificateController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Certificate")
}

func (controller *CertificateController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CertificateRenderMain",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Certificate/:id?",
		Handler: controller.handler.GetCertificate,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateCertificate",
		Handler: controller.handler.CreateCertificate,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateCertificateRender",
		Handler: controller.handler.CreateCertificateRender,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateCertificate/:id",
		Handler: controller.handler.UpdateCertificate,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteCertificate/:id",
		Handler: controller.handler.DeleteCertificate,
		Method:  core.POST,
	})
	return routeList
}

func (controller *CertificateController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *CertificateController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
